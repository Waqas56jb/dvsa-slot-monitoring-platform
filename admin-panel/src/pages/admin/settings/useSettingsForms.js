import { useCallback, useEffect, useMemo, useState } from 'react'
import { settingsService } from '@/services/settingsService'
import { READ_ONLY_KEYS, VALIDATORS } from './settingsConfig'

const editableKeys = (section, saved) => Object.keys(saved || {}).filter((k) => !(READ_ONLY_KEYS[section] || []).includes(k))

// Number fields are edited as strings (so users can clear the input); everything else keeps its type.
const toDraft = (values) => Object.fromEntries(Object.entries(values || {}).map(([k, v]) => [k, typeof v === 'number' ? String(v) : v]))
const toValue = (draft, savedValue) => {
  if (typeof savedValue !== 'number') return typeof draft === 'string' ? draft.trim() : draft
  const s = String(draft ?? '').trim()
  return s === '' ? NaN : Number(s)
}

/**
 * Per-section drafts for the settings page. Drafts live here (not in the
 * section components) so switching sections keeps unsaved edits.
 */
export function useSettingsForms(initial) {
  const [saved, setSaved] = useState(null)
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    if (!initial) return
    setSaved(initial)
    setDraft(Object.fromEntries(Object.entries(initial).map(([s, v]) => [s, toDraft(v)])))
  }, [initial])

  const setField = useCallback((section, key, value) => {
    setDraft((d) => ({ ...d, [section]: { ...d[section], [key]: value } }))
    setErrors((e) => (e[section]?.[key] || e[section]?.channels ? { ...e, [section]: { ...e[section], [key]: null, channels: null } } : e))
  }, [])

  const dirty = useMemo(() => {
    const out = {}
    if (!saved || !draft) return out
    for (const section of Object.keys(saved)) {
      out[section] = editableKeys(section, saved[section]).some((k) => String(draft[section]?.[k]) !== String(saved[section][k]))
    }
    return out
  }, [saved, draft])

  const values = useCallback((section) => Object.fromEntries(editableKeys(section, saved[section]).map((k) => [k, toValue(draft[section][k], saved[section][k])])), [saved, draft])

  /** Returns { ok, values } — sets field errors when invalid. */
  const validate = useCallback((section) => {
    const v = values(section)
    const errs = VALIDATORS[section]?.(v) || {}
    setErrors((e) => ({ ...e, [section]: errs }))
    return { ok: !Object.values(errs).some(Boolean), values: v }
  }, [values])

  /** Persists a section. Throws on failure (field errors from the API are applied first). */
  const commit = useCallback(async (section, v) => {
    setSaving(section)
    try {
      const result = await settingsService.updateSettings(section, v)
      const next = { ...saved[section], ...result }
      setSaved((s) => ({ ...s, [section]: next }))
      setDraft((d) => ({ ...d, [section]: toDraft(next) }))
      setErrors((e) => ({ ...e, [section]: {} }))
      return next
    } catch (err) {
      if (err.details) setErrors((e) => ({ ...e, [section]: err.details }))
      throw err
    } finally {
      setSaving(null)
    }
  }, [saved])

  const reset = useCallback((section) => {
    setDraft((d) => ({ ...d, [section]: toDraft(saved[section]) }))
    setErrors((e) => ({ ...e, [section]: {} }))
  }, [saved])

  return { ready: !!draft, saved, draft, errors, saving, dirty, setField, validate, commit, reset }
}
