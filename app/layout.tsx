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
        <div className="p-2 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-2">
              Here, In this CRUD application I have mostly used Next.js 16
              features(server components, server actions...) but we can use it
              with states at client components to make the app faster & optimize performance.
            </p>
          </div>
        </div>
        <AuthProvider user={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}
