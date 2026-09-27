import { useCallback, useMemo, useRef, useState } from 'react';
import { validate as runValidate, hasErrors } from '@/utils/validation';

/**
 * Lightweight form state + validation.
 *
 *   const form = useForm({ email: '', password: '' }, {
 *     email: [rules.required('Email'), rules.email()],
 *   });
 *   <Input {...form.field('email')} label="Email" />
 *   <form onSubmit={form.handleSubmit(async (values) => { ... })}>
 *
 * Errors show after a field is blurred or after the first submit attempt.
 */
export function useForm(initialValues, schema = {}) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const errors = useMemo(() => ({ ...runValidate(values, schemaRef.current), ...serverErrors }), [values, serverErrors]);

  const setValue = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setServerErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  }, []);

  const visibleError = (name) => ((touched[name] || submitted) && errors[name]) || '';

  /** Props for text-like inputs. */
  const field = (name) => ({
    name,
    id: name,
    value: values[name] ?? '',
    onChange: (e) => setValue(name, e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
    error: visibleError(name),
  });

  const handleSubmit = (onValid) => async (e) => {
    e?.preventDefault?.();
    setSubmitted(true);
    const current = runValidate(values, schemaRef.current);
    if (hasErrors(current)) {
      const first = Object.keys(current).find((k) => current[k]);
      document.getElementById(first)?.focus?.();
      return;
    }
    setSubmitting(true);
    try {
      await onValid(values);
    } catch (err) {
      if (err?.field) setServerErrors({ [err.field]: err.message });
      else throw err;
    } finally {
      setSubmitting(false);
    }
  };

  /** Validate a subset of fields (for multi-step wizards). Returns true when valid. */
  const validateFields = (names) => {
    const current = runValidate(values, schemaRef.current);
    setTouched((t) => ({ ...t, ...Object.fromEntries(names.map((n) => [n, true])) }));
    return !names.some((n) => current[n]);
  };

  const reset = (next = initialValues) => {
    setValues(next);
    setTouched({});
    setSubmitted(false);
    setServerErrors({});
  };

  return {
    values,
    setValues,
    setValue,
    errors,
    error: visibleError,
    touched,
    field,
    handleSubmit,
    validateFields,
    submitting,
    setServerErrors,
    reset,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
  };
}
