import { useEffect, useState } from 'react'
import { MapPinPlus, MapPinned } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { FormField, Input, Select, Textarea } from '@/components/forms/Fields'
import { centreService } from '@/services/centreService'
import { useToast } from '@/context/NotificationContext'
import { REGIONS, CENTRE_STATUSES } from '@/constants/status'

const EMPTY = { name: '', code: '', address: '', postcode: '', city: '', region: 'London', lat: '', lng: '', checkInterval: '120', status: 'Active', notes: '' }
const INTERVALS = [60, 90, 120, 180, 300].map((s) => ({ value: String(s), label: s < 120 ? `Every ${s} seconds` : `Every ${s / 60} minutes` }))
const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i
const CODE_RE = /^[A-Z0-9-]{3,12}$/i

const fromCentre = (c) => ({
  name: c.name || '', code: c.code || '', address: c.address || '', postcode: c.postcode || '', city: c.city || '', region: c.region || 'London',
  lat: c.coordinates?.lat != null ? String(c.coordinates.lat) : '', lng: c.coordinates?.lng != null ? String(c.coordinates.lng) : '',
  checkInterval: String(c.checkInterval || 120), status: c.status || 'Active', notes: c.notes || '',
})

/** Create (centre = null) or edit a test centre. onSaved(centre) receives the result. */
export function CentreFormModal({ open, onClose, centre, onSaved }) {
  const editing = !!centre
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => { if (open) { setForm(centre ? fromCentre(centre) : EMPTY); setErrors({}) } }, [open, centre])

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: null })) }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 3) e.name = 'Enter the centre name.'
    if (!CODE_RE.test(form.code.trim())) e.code = 'Use 3–12 letters, numbers or hyphens, e.g. TC-WG100.'
    if (form.address.trim().length < 5) e.address = 'Enter the street address.'
    if (!POSTCODE_RE.test(form.postcode.trim())) e.postcode = 'Enter a valid UK postcode, e.g. N22 6HH.'
    if (form.city.trim().length < 2) e.city = 'Enter the town or city.'
    if (!form.region) e.region = 'Choose a region.'
    const lat = Number(form.lat), lng = Number(form.lng)
    if (form.lat === '' || Number.isNaN(lat) || lat < 49.8 || lat > 60.9) e.lat = 'Latitude must be within the UK (49.8 to 60.9).'
    if (form.lng === '' || Number.isNaN(lng) || lng < -8.7 || lng > 1.8) e.lng = 'Longitude must be within the UK (−8.7 to 1.8).'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(), code: form.code.trim().toUpperCase(), address: form.address.trim(), postcode: form.postcode.trim().toUpperCase(),
        city: form.city.trim(), notes: form.notes.trim(), lat: Number(form.lat), lng: Number(form.lng), checkInterval: Number(form.checkInterval),
      }
      const saved = editing ? await centreService.updateCentre(centre.id, payload) : await centreService.createCentre(payload)
      toast.success(editing ? 'Test centre updated.' : 'Test centre added.')
      onSaved?.(saved)
      onClose()
    } catch (err) {
      if (err.details) setErrors(err.details)
      else toast.error(err.message || 'Unable to save this test centre.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      dismissible={!saving}
      size="lg"
      title={editing ? 'Edit test centre' : 'Add test centre'}
      description={editing ? 'Changes are recorded in the audit log and apply to the next check cycle.' : 'Add a centre that users can select for monitoring.'}
      icon={editing ? MapPinned : MapPinPlus}
      tone="brand"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>{editing ? 'Save changes' : 'Add centre'}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <FormField label="Centre name" required error={errors.name} className="sm:col-span-2">
          {(p) => <Input {...p} value={form.name} onChange={set('name')} error={errors.name} placeholder="Wood Green Driving Test Centre" data-autofocus autoComplete="off" />}
        </FormField>
        <FormField label="Centre code" required error={errors.code} hint="Unique internal reference.">
          {(p) => <Input {...p} value={form.code} onChange={set('code')} error={errors.code} placeholder="TC-WG100" className="font-mono uppercase" autoComplete="off" spellCheck={false} />}
        </FormField>
        <FormField label="Region" required error={errors.region}>
          {(p) => <Select {...p} value={form.region} onChange={set('region')} options={REGIONS} error={errors.region} />}
        </FormField>
        <FormField label="Address" required error={errors.address} className="sm:col-span-2">
          {(p) => <Input {...p} value={form.address} onChange={set('address')} error={errors.address} placeholder="12 Station Road" autoComplete="off" />}
        </FormField>
        <FormField label="Town or city" required error={errors.city}>
          {(p) => <Input {...p} value={form.city} onChange={set('city')} error={errors.city} autoComplete="off" />}
        </FormField>
        <FormField label="Postcode" required error={errors.postcode}>
          {(p) => <Input {...p} value={form.postcode} onChange={set('postcode')} error={errors.postcode} placeholder="N22 6HH" className="uppercase" autoComplete="off" />}
        </FormField>
        <FormField label="Latitude" required error={errors.lat}>
          {(p) => <Input {...p} type="number" inputMode="decimal" step="0.0001" value={form.lat} onChange={set('lat')} error={errors.lat} placeholder="51.5970" className="tabular" />}
        </FormField>
        <FormField label="Longitude" required error={errors.lng}>
          {(p) => <Input {...p} type="number" inputMode="decimal" step="0.0001" value={form.lng} onChange={set('lng')} error={errors.lng} placeholder="-0.1090" className="tabular" />}
        </FormField>
        <FormField label="Check interval" hint="Default interval between availability checks.">
          {(p) => <Select {...p} value={form.checkInterval} onChange={set('checkInterval')} options={INTERVALS} />}
        </FormField>
        <FormField label="Status" hint={form.status === 'Inactive' ? 'Inactive centres are not checked.' : 'Active centres are included in checks.'}>
          {(p) => <Select {...p} value={form.status} onChange={set('status')} options={CENTRE_STATUSES} />}
        </FormField>
        <FormField label="Internal notes" className="sm:col-span-2" hint="Only visible to admins.">
          {(p) => <Textarea {...p} rows={3} value={form.notes} onChange={set('notes')} />}
        </FormField>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
