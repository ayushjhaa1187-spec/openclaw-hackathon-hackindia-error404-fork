import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "../styles/globals.css";

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
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-emerald-900/5 rounded-full blur-[100px] animate-bounce"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
