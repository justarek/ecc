"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { registerAction, type AuthActionState } from "@/app/actions/auth";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    registerAction,
    null
  );
  const t = useTranslations("auth");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          {t("fullName")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
          {t("phoneOptional")}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="01012345678"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {state?.fieldErrors?.phone && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? t("creatingAccount") : t("createAccountButton")}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
