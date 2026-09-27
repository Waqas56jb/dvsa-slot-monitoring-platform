import { useEffect, useId, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { FormField, Input, Select, Toggle } from '@/components/forms/Fields'
import { CentrePicker } from '@/components/monitoring/CentrePicker'
import { FREQUENCY_OPTIONS } from '@/components/monitoring/format'
import { useAsync } from '@/hooks/useAsync'
import { monitoringService } from '@/services/monitoringService'
import { centreService } from '@/services/centreService'
import { useToast } from '@/context/NotificationContext'

const fromJob = (j) => ({
  dateFrom: j.dateFrom, dateTo: j.dateTo, timeFrom: j.timeFrom, timeTo: j.timeTo,
  frequency: String(j.frequency), centreIds: [...(j.centreIds || [])], weekdaysOnly: !!j.weekdaysOnly,
})

/** Edit a monitoring job's preferences. onSaved(updatedJob). */
export function JobEditModal({ open, onClose, job, onSaved }) {
  const [form, setForm] = useState(() => fromJob(job))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const centresId = useId()
  const centres = useAsync(() => (open ? centreService.getAllCentres() : Promise.resolve(undefined)), [open])

  useEffect(() => { if (open) { setForm(fromJob(job)); setErrors({}) } }, [open, job])

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((x) => ({ ...x, [k]: null })) }
  const onInput = (k) => (e) => set(k, e.target.value)

  const validate = () => {
    const e = {}
    if (!form.dateFrom) e.dateFrom = 'Choose a start date.'
    if (!form.dateTo) e.dateTo = 'Choose an end date.'
    else if (form.dateFrom && form.dateTo <= form.dateFrom) e.dateTo = 'End date must be after the start date.'
    if (!form.timeFrom) e.timeFrom = 'Choose a start time.'
    if (!form.timeTo) e.timeTo = 'Choose an end time.'
    else if (form.timeFrom && form.timeTo <= form.timeFrom) e.timeTo = 'End time must be after the start time.'
    if (!form.centreIds.length) e.centreIds = 'Select at least one test centre.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const updated = await monitoringService.updateJob(job.id, { ...form, frequency: Number(form.frequency) })
      toast.success('Monitoring job updated.')
      onSaved?.(updated)
      onClose()
    } catch (err) {
      if (err.details) setErrors(err.details)
      else toast.error(err.message || 'Unable to update this job.')
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
      title="Edit monitoring job"
      description={`Changes to ${job.id} apply from the next check and are recorded in the audit log.`}
      icon={SlidersHorizontal}
      tone="brand"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Save changes</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <FormField label="Earliest test date" required error={errors.dateFrom}>
          {(p) => <Input {...p} type="date" value={form.dateFrom} onChange={onInput('dateFrom')} error={errors.dateFrom} data-autofocus />}
        </FormField>
        <FormField label="Latest test date" required error={errors.dateTo}>
          {(p) => <Input {...p} type="date" value={form.dateTo} min={form.dateFrom || undefined} onChange={onInput('dateTo')} error={errors.dateTo} />}
        </FormField>
        <FormField label="From time" required error={errors.timeFrom}>
          {(p) => <Input {...p} type="time" value={form.timeFrom} onChange={onInput('timeFrom')} error={errors.timeFrom} />}
        </FormField>
        <FormField label="To time" required error={errors.timeTo}>
          {(p) => <Input {...p} type="time" value={form.timeTo} onChange={onInput('timeTo')} error={errors.timeTo} />}
        </FormField>
        <FormField label="Check frequency" hint="How often the backend checks for matching availability.">
          {(p) => <Select {...p} value={form.frequency} onChange={onInput('frequency')} options={FREQUENCY_OPTIONS} />}
        </FormField>
        <div className="flex items-end pb-1 sm:pb-6">
          <Toggle className="w-full" checked={form.weekdaysOnly} onChange={(v) => set('weekdaysOnly', v)} label="Weekdays only" description="Ignore Saturday and Sunday slots." />
        </div>
        <FormField label="Test centres" required error={errors.centreIds} htmlFor={centresId} className="sm:col-span-2" hint="Only active centres can be added.">
          {(p) => (
            <CentrePicker
              id={centresId}
              describedBy={p['aria-describedby']}
              centres={centres.data || []}
              loading={centres.loading}
              value={form.centreIds}
              onChange={(v) => set('centreIds', v)}
              error={errors.centreIds}
            />
          )}
        </FormField>
        {centres.error && <p className="text-xs text-danger sm:col-span-2" role="alert">Unable to load test centres. Close and try again.</p>}
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
