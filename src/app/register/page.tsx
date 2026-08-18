import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage() {
  const t = useTranslations("auth");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("createAccount")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("createAccountSubtitle")}</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
