import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/custom/Navbar"; // Import Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptKeep",
  description: "Manage your prompts efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Added dark class for default theme */}
      <body className={inter.className}>
        <Navbar /> {/* Add Navbar here */}
        <main className="container mx-auto px-4 py-8"> {/* Add a main wrapper */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
