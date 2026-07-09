import { NavigationBar } from "@/components/dashboard/navigation-bar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <NavigationBar />
    </div>
  );
}