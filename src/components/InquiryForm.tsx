"use client";

import { useActionState } from "react";
import { sendInquiryAction, type InquiryActionState } from "@/app/actions/inquiries";
import type { CurrentUser } from "@/lib/auth";

export default function InquiryForm({
  listingId,
  user,
}: {
  listingId: string;
  user: CurrentUser | null;
}) {
  const [state, formAction, pending] = useActionState<InquiryActionState, FormData>(
    sendInquiryAction,
    null
  );

  if (state?.success) {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
        Thanks! Your message has been sent. The lister will contact you soon.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="listingId" value={listingId} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <input
          name="name"
          placeholder="Your name"
          defaultValue={user?.name ?? ""}
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <input
          name="phone"
          placeholder="Phone number"
          defaultValue={user?.phone ?? ""}
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {state?.fieldErrors?.phone && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone[0]}</p>
        )}
      </div>

      <div>
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          defaultValue={user?.email ?? ""}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <textarea
          name="message"
          placeholder="I'm interested in this property..."
          rows={3}
          required
          defaultValue="I'm interested in this property. Please contact me with more details."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {state?.fieldErrors?.message && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
