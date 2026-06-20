import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Create your workspace · Penkala" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
