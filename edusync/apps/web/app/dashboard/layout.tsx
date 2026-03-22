import NavBar from "../../components/layouts/NavBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen pt-4 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        {children}
      </div>
    </div>
  );
}
