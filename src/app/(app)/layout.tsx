import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1">
      <AppSidebar />
      <main className="flex min-h-full flex-1 flex-col">{children}</main>
    </div>
  );
}
