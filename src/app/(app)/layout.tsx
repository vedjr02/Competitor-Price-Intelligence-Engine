import { AppShell } from "@/components/layout/app-shell";
import { getProductCatalog } from "@/lib/products/selection";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await getProductCatalog();

  return <AppShell catalog={catalog}>{children}</AppShell>;
}
