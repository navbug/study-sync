import Link from 'next/link';
import { getMaterials } from '@/lib/actions/materials';
import { getFlashcards } from '@/lib/actions/flashcards';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default async function DashboardPage() {
  let materialsCount = 0;
  let flashcardsCount = 0;

  try {
    const [materialsResult, flashcardsResult] = await Promise.all([
      getMaterials(),
      getFlashcards(),
    ]);

    materialsCount = materialsResult.success ? materialsResult.data?.length || 0 : 0;
    flashcardsCount = flashcardsResult.success ? flashcardsResult.data?.length || 0 : 0;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your study overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Materials</p>
                <p className="text-3xl font-bold text-gray-900">{materialsCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Flashcards</p>
                <p className="text-3xl font-bold text-gray-900">{flashcardsCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎴</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">AI Features</p>
                <p className="text-3xl font-bold text-gray-900">2</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Create Study Material
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add new notes and organize your learning
                  </p>
                  <Link href="/materials">
                    <Button variant="primary">Create Material</Button>
                  </Link>
                </div>
                <span className="text-4xl">📝</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Generate Flashcards
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use AI to create flashcards from your materials
                  </p>
                  <Link href="/flashcards">
                    <Button variant="primary">View Flashcards</Button>
                  </Link>
                </div>
                <span className="text-4xl">⚡</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Summaries</h3>
                <p className="text-sm text-gray-600">
                  Generate concise summaries of your study materials automatically
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Auto Flashcards</h3>
                <p className="text-sm text-gray-600">
                  Automatically create flashcards from your notes with AI
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}