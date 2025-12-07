'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createMaterial, updateMaterial, deleteMaterial } from '@/lib/actions/materials';
import { generateAISummary } from '@/lib/actions/ai';
import type { Material } from '@/types';

interface MaterialsListProps {
  initialMaterials: Material[];
}

export default function MaterialsList({ initialMaterials }: MaterialsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);
  
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [subjectFilter, setSubjectFilter] = useState(searchParams.get('subject') || '');

  const subjects = [...new Set(initialMaterials.map(m => m.subject))];

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setSubjectFilter(searchParams.get('subject') || '');
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchInput) params.set('search', searchInput);
      if (subjectFilter) params.set('subject', subjectFilter);
      
      startTransition(() => {
        router.push(`/materials${params.toString() ? '?' + params.toString() : ''}`);
      });
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [searchInput, subjectFilter, router]);

  const handleSubjectChange = (subject: string) => {
    setSubjectFilter(subject);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        let result;
        if (editingMaterial) {
          result = await updateMaterial(editingMaterial._id, formData);
        } else {
          result = await createMaterial(formData);
        }

        if (result.success) {
          setIsFormModalOpen(false);
          setEditingMaterial(null);
          (e.target as HTMLFormElement).reset();
          router.refresh();
        } else {
          setError(result.error || 'Operation failed');
        }
      } catch (err) {
        setError('An error occurred');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    startTransition(async () => {
      const result = await deleteMaterial(id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'Delete failed');
      }
    });
  };

  const handleGenerateSummary = async (material: Material) => {
    setAiLoading(material._id);
    setError(null);

    startTransition(async () => {
      try {
        const result = await generateAISummary(material._id);
        
        if (result.success) {
          setAiLoading(null);
          router.refresh();
        } else {
          setError(result.error || 'Failed to generate summary');
          setAiLoading(null);
        }
      } catch (err) {
        setError('Failed to generate summary');
        setAiLoading(null);
      }
    });
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setError(null);
    setIsFormModalOpen(true);
  };

  const openViewModal = (material: Material) => {
    setViewingMaterial(material);
    setIsViewModalOpen(true);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSubjectFilter('');
    startTransition(() => {
      router.push('/materials');
    });
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex justify-between gap-4 flex-wrap">
        <Input
          placeholder="Search materials..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-4">
        <select
          value={subjectFilter}
          onChange={(e) => handleSubjectChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        <Button variant="primary" onClick={openCreateModal}>
          + Create Material
        </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">Loading...</p>
        </div>
      )}

      {/* Materials Grid */}
      {initialMaterials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">
              {searchInput || subjectFilter ? 
                'No materials found matching your filters.' : 
                'No materials found. Create your first one!'
              }
            </p>
            {(searchInput || subjectFilter) && (
              <Button 
                variant="secondary" 
                onClick={clearFilters}
                className="mr-2"
              >
                Clear Filters
              </Button>
            )}
            <Button variant="primary" onClick={openCreateModal}>
              Create Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialMaterials.map((material) => (
            <Card key={material._id} className="flex flex-col h-[360px]">
              <CardContent className="pt-6 flex-1 overflow-hidden flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {material.title}
                  </h3>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {material.subject}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-4 flex-1">
                  {material.content.slice(0, 200)}{material.content.length > 200 ? '...' : ''}
                </p>
                {material.tags && material.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {material.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {material.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{material.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                {material.aiSummary && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-2 mt-2">
                    <p className="text-xs text-purple-900 font-medium mb-1">✨ Has AI Summary</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 flex-wrap border-t">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openViewModal(material)}
                >
                  👁️ View
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditModal(material)}
                  disabled={isPending}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGenerateSummary(material)}
                  isLoading={aiLoading === material._id}
                  disabled={isPending || aiLoading === material._id}
                >
                  ✨ {material.aiSummary ? 'Regenerate' : 'Summary'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(material._id)}
                  disabled={isPending}
                >
                  🗑️
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* View Material Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingMaterial(null);
        }}
        title={viewingMaterial?.title || 'Material Details'}
        size="xl"
      >
        {viewingMaterial && (
          <div className="space-y-4">
            {/* Subject Badge */}
            <div>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
                {viewingMaterial.subject}
              </span>
            </div>

            {/* Tags */}
            {viewingMaterial.tags && viewingMaterial.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingMaterial.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Content:</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                <p className="text-gray-800 whitespace-pre-wrap">{viewingMaterial.content}</p>
              </div>
            </div>

            {/* AI Summary */}
            {viewingMaterial.aiSummary && (
              <div>
                <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                  ✨ AI Generated Summary:
                </h4>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-purple-900 whitespace-pre-wrap">{viewingMaterial.aiSummary}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              {!viewingMaterial.aiSummary && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleGenerateSummary(viewingMaterial);
                  }}
                  disabled={aiLoading === viewingMaterial._id}
                >
                  ✨ Generate AI Summary
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(viewingMaterial);
                }}
              >
                ✏️ Edit Material
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMaterial(null);
          setError(null);
        }}
        title={editingMaterial ? 'Edit Material' : 'Create Material'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <Input
            label="Title"
            name="title"
            defaultValue={editingMaterial?.title || ''}
            required
            disabled={isPending}
          />
          <Input
            label="Subject"
            name="subject"
            defaultValue={editingMaterial?.subject || ''}
            required
            disabled={isPending}
          />
          <Textarea
            label="Content"
            name="content"
            defaultValue={editingMaterial?.content || ''}
            rows={8}
            required
            disabled={isPending}
          />
          <Input
            label="Tags (comma-separated)"
            name="tags"
            defaultValue={editingMaterial?.tags?.join(', ') || ''}
            placeholder="math, algebra, equations"
            disabled={isPending}
          />
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsFormModalOpen(false);
                setEditingMaterial(null);
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isPending}
              disabled={isPending}
            >
              {editingMaterial ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}