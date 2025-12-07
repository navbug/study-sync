import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getFlashcards } from '@/lib/actions/flashcards';
import { getMaterials } from '@/lib/actions/materials';
import FlashcardsList from '@/components/features/FlashcardsList';

export default async function FlashcardsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const [flashcardsResult, materialsResult] = await Promise.all([
    getFlashcards(),
    getMaterials(),
  ]);

  const flashcards = flashcardsResult.success ? flashcardsResult.data || [] : [];
  const materials = materialsResult.success ? materialsResult.data || [] : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">Study with flashcards or generate them with AI</p>
        </div>
      </div>

      <FlashcardsList 
        initialFlashcards={flashcards} 
        materials={materials}
      />
    </div>
  );
}