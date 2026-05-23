import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col xl:flex-row">
      <AppSidebar />
      <div className="flex min-h-full flex-1 flex-col">
        <MobileNav />
        <main className="flex min-h-full flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
