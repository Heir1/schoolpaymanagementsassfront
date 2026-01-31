import DashboardGuard from "./DashboardGuard";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <DashboardHeader />
      <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
        <DashboardSidebar />
        <main className="flex-1 min-w-0 ml-64 h-[calc(100vh-4rem)] overflow-auto">
          {children}
        </main>
      </div>
    </DashboardGuard>
  );
}
