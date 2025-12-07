import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import DashboardNav from "@/components/features/DashobardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>
              Built by <strong>Naveen Bugalia</strong>. Technologies: Next JS 16, React JS 19, Tailwind CSS, MongoDB and Gemini AI
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <a
                href="https://github.com/navbug"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/naveenbugalia512/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}