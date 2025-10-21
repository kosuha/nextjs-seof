import { signOut } from "@/lib/auth/actions";

export default async function LogoutPage() {
  await signOut();
  return null;
}
