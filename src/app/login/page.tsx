import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const sp = await searchParams;
  const redirectTo = typeof sp.redirectTo === "string" ? sp.redirectTo : undefined;
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("welcomeBack")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
