import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Join DarMasr to post listings and save your favorite properties.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
