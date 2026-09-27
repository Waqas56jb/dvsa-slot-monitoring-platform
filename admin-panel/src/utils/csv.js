/**
 * Client-side CSV export used in mock mode. Once the API exists this can be
 * swapped for a server-generated file download without touching callers.
 */
function escapeCell(v) {
  if (v == null) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** columns: [{ label, key } | { label, value: (row) => any }] */
export function toCSV(rows, columns) {
  const cols = columns || Object.keys(rows[0] || {}).map((key) => ({ key, label: key }))
  const header = cols.map((c) => escapeCell(c.label)).join(',')
  const body = rows.map((r) => cols.map((c) => escapeCell(c.value ? c.value(r) : r[c.key])).join(','))
  return [header, ...body].join('\r\n')
}

export function downloadCSV(filename, rows, columns) {
  const csv = '﻿' + toCSV(rows, columns)
  downloadBlob(filename.endsWith('.csv') ? filename : `${filename}.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }))
}

export function downloadText(filename, text) {
  downloadBlob(filename, new Blob([text], { type: 'text/plain;charset=utf-8' }))
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const exportStamp = () => new Date().toISOString().slice(0, 10)
