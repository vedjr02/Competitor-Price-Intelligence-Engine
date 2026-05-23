import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getProductCatalog } from "@/lib/products/selection";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [catalog, session] = await Promise.all([
    getProductCatalog(),
    getCurrentProfile(),
  ]);

  return (
    <AppShell catalog={catalog} profile={session?.profile ?? null}>
      {children}
    </AppShell>
  );
}
