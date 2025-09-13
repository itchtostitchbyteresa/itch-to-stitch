'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';

const FORMSPREE = 'https://formspree.io/f/xqadjnyp'; 

export default function Page() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot check (anti-bot)
    if (data.get('hp')) {
      setStatus('ok'); // pretend success
      form.reset();
      return;
    }

    // Subject for your inbox (optional but nice)
    data.set('_subject', 'New message from Itch To Stitch');

    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setStatus('ok');
        setMessage('Thanks! I got your message and will reply soon.');
        form.reset();
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again, or email me.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again, or email me.');
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-rose-700">Contact</h1>
        <p className="mt-3 text-gray-700">
          Questions, ideas, or friendly yarn chat — drop me a note below.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {/* Honeypot (should stay empty) */}
          <input name="hp" type="text" className="hidden" tabIndex={-1} autoComplete="off" />

          <label className="block">
            <span className="text-sm text-gray-700">Name</span>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Message</span>
            <textarea
              name="message"
              required
              rows={6}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
            />
          </label>

          {/* Optional: show where the form is coming from */}
          <input type="hidden" name="page" value="contact" />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-5 py-3 rounded-xl bg-black text-white disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Send'}
          </button>

          {status !== 'idle' && (
            <p
              className={
                'text-sm mt-2 ' +
                (status === 'ok' ? 'text-green-700' : status === 'error' ? 'text-red-700' : 'text-gray-600')
              }
            >
              {message}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
