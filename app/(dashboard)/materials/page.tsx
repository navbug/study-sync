import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getMaterials } from '@/lib/actions/materials';
import MaterialsList from '@/components/features/MaterialsList';

interface PageProps {
  searchParams: Promise<{ search?: string; subject?: string }>;
}

export default async function MaterialsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const { search, subject } = resolvedParams;
  
  const result = await getMaterials(search, subject);

  const materials = result.success ? result.data || [] : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Materials</h1>
          <p className="text-gray-600">Manage your study notes and materials</p>
        </div>
      </div>

      <MaterialsList initialMaterials={materials} />
    </div>
  );
}