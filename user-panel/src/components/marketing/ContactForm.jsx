import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Send, User } from 'lucide-react';
import { Button, Input, Select, SuccessState, Textarea } from '@/components/ui';
import { useForm } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { rules } from '@/utils/validation';
import { EASE } from './Reveal';

const topics = [
  { value: 'general', label: 'General question' },
  { value: 'sales', label: 'Plans & pricing' },
  { value: 'support', label: 'Help with my account' },
  { value: 'school', label: 'Driving school / team setup' },
  { value: 'feedback', label: 'Feedback or feature request' },
  { value: 'privacy', label: 'Privacy & data request' },
];

const initial = { name: '', email: '', topic: '', message: '' };

const schema = {
  name: [rules.required('Your name'), rules.minLength(2, 'Your name')],
  email: [rules.required('Email'), rules.email()],
  topic: [rules.required('Topic')],
  message: [rules.required('Message'), rules.minLength(20, 'Your message'), rules.maxLength(2000, 'Your message')],
};

/**
 * PLACEHOLDER: no backend yet. Replace with `supportService.sendMessage(values)`
 * once a support endpoint exists. Nothing is sent over the network here.
 */
const simulateSend = () => new Promise((resolve) => setTimeout(resolve, 1100));

export function ContactForm() {
  const form = useForm(initial, schema);
  const toast = useToast();
  const [sentTo, setSentTo] = useState(null);

  const onSubmit = form.handleSubmit(async (values) => {
    await simulateSend(values);
    setSentTo(values.email);
    toast.success('Message sent', { description: 'Thanks — we will reply by email.' });
  });

  const startAgain = () => {
    form.reset();
    setSentTo(null);
  };

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {sentTo ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
            <SuccessState
              className="py-10"
              title="Thanks, your message is on its way"
              description={`We will reply to ${sentTo}, usually within one working day.`}
              action={
                <Button variant="secondary" onClick={startAgain}>
                  Send another message
                </Button>
              }
            />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-5"
            aria-label="Contact form"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input {...form.field('name')} label="Name" required icon={User} autoComplete="name" placeholder="Your full name" />
              <Input {...form.field('email')} label="Email" type="email" required icon={Mail} autoComplete="email" placeholder="you@example.com" />
            </div>
            <Select {...form.field('topic')} label="Topic" required options={topics} placeholder="Choose a topic" />
            <Textarea
              {...form.field('message')}
              label="Message"
              required
              rows={6}
              placeholder="How can we help? Please don’t include learner licence numbers or other sensitive details."
              hint={`${form.values.message.length} / 2000 characters`}
            />
            <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-subtle">We only use your details to reply to this message.</p>
              <Button type="submit" size="lg" loading={form.submitting} rightIcon={Send}>
                {form.submitting ? 'Sending…' : 'Send message'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
