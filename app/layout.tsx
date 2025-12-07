import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { getCurrentUser } from "@/lib/actions/auth";
import "./globals.css";
import { Info } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "StudySync - AI-Powered Learning",
  description: "Master your studies with AI assistance",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider user={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}
