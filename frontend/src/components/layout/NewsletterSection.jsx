import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Thanks — we will send drops & offers to your inbox.');
    setEmail('');
  }

  return (
    <section className="border-y border-neutral-200 bg-neutral-100 py-14">
      <div className="container-app text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Stay in the loop</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-neutral-900 md:text-3xl">AURVEXA newsletter</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-600">
          New drops, limited colours, and seasonal offers. No spam — unsubscribe anytime.
        </p>
        <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={submit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="flex-1 rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none ring-neutral-900 focus:border-neutral-900 focus:ring-1"
          />
          <button
            type="submit"
            className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
