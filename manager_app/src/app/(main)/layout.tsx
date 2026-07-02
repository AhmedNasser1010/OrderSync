import { BottomNav } from "@/components/dashboard/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-4 p-4 md:p-6 bg-background">
      {children}
      <BottomNav />
    </div>
  );
}