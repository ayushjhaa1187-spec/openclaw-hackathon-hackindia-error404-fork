import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "../styles/globals.css";
import { Navigation } from "../components/shared/navigation";
import { Footer } from "../components/shared/footer";
import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { Toaster as Sonner } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "EduSync | Federated Academic Collaboration",
  description: "Bridging the institutional gap with multi-campus skill sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-slate-950 text-slate-50 min-h-screen flex flex-col`}>
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>
        
        <ErrorBoundary>
          <Navigation />
          
          <main className="flex-grow">
            {children}
          </main>
  
          <Footer />
          <Toaster position="bottom-right" reverseOrder={false} />
          <Sonner theme="dark" position="top-right" closeButton />
        </ErrorBoundary>
      </body>
    </html>
  );
}
