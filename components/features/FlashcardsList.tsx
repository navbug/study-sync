'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createFlashcard, updateFlashcard, deleteFlashcard } from '@/lib/actions/flashcards';
import { generateAIFlashcards } from '@/lib/actions/ai';
import type { Flashcard, Material } from '@/types';

interface FlashcardsListProps {
  initialFlashcards: Flashcard[];
  materials: Material[];
}

export default function FlashcardsList({ initialFlashcards, materials }: FlashcardsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        let result;
        if (editingCard) {
          result = await updateFlashcard(editingCard._id, formData);
        } else {
          result = await createFlashcard(formData);
        }

        if (result.success) {
          setIsModalOpen(false);
          setEditingCard(null);
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

  const handleGenerateAI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const materialId = formData.get('materialId') as string;
    const count = parseInt(formData.get('count') as string);

    if (!materialId) {
      setError('Please select a material');
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateAIFlashcards(materialId, count);

        if (result.success) {
          setIsAIModalOpen(false);
          (e.target as HTMLFormElement).reset();
          router.refresh();
        } else {
          setError(result.error || 'Failed to generate flashcards');
        }
      } catch (err) {
        setError('Failed to generate flashcards');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;

    startTransition(async () => {
      const result = await deleteFlashcard(id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'Delete failed');
      }
    });
  };

  const toggleFlip = (id: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(id)) {
      newFlipped.delete(id);
    } else {
      newFlipped.add(id);
    }
    setFlippedCards(newFlipped);
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (card: Flashcard) => {
    setEditingCard(card);
    setError(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <Button 
          variant="secondary" 
          onClick={() => {
            setError(null);
            setIsAIModalOpen(true);
          }}
          disabled={materials.length === 0 || isPending}
        >
          ✨ Generate with AI
        </Button>
        <Button variant="primary" onClick={openCreateModal} disabled={isPending}>
          + Create Flashcard
        </Button>
      </div>

      {materials.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Create some study materials first to use AI generation!</p>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">Loading...</p>
        </div>
      )}

      {/* Flashcards Grid */}
      {initialFlashcards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No flashcards yet. Create one or generate with AI!</p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setError(null);
                  setIsAIModalOpen(true);
                }}
                disabled={materials.length === 0}
              >
                ✨ Generate with AI
              </Button>
              <Button variant="primary" onClick={openCreateModal}>
                Create Flashcard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialFlashcards.map((card) => (
            <div key={card._id} className="perspective-1000">
              <div
                className={`relative transition-transform duration-500 transform-style-preserve-3d cursor-pointer ${
                  flippedCards.has(card._id) ? 'rotate-y-180' : ''
                }`}
                onClick={() => toggleFlip(card._id)}
              >
                {/* Front */}
                <Card className={`backface-hidden ${flippedCards.has(card._id) ? 'invisible' : ''}`}>
                  <CardContent className="pt-6 min-h-[200px] flex flex-col">
                    <div className="mb-4 flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {card.subject}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        card.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        card.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {card.difficulty}
                      </span>
                      {card.isAIGenerated && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          ✨ AI
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-900 text-center font-medium">
                        {card.question}
                      </p>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Click to reveal answer
                    </p>
                  </CardContent>
                </Card>

                {/* Back */}
                <Card className={`absolute top-0 left-0 w-full backface-hidden rotate-y-180 ${!flippedCards.has(card._id) ? 'invisible' : ''}`}>
                  <CardContent className="pt-6 min-h-[200px] flex flex-col bg-blue-50">
                    <p className="text-sm text-blue-600 mb-2 font-medium">Answer:</p>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-900 text-center">
                        {card.answer}
                      </p>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Click to see question
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(card);
                  }}
                  disabled={isPending}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(card._id);
                  }}
                  disabled={isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
          setError(null);
        }}
        title={editingCard ? 'Edit Flashcard' : 'Create Flashcard'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <Textarea
            label="Question"
            name="question"
            defaultValue={editingCard?.question || ''}
            rows={3}
            required
            disabled={isPending}
          />
          <Textarea
            label="Answer"
            name="answer"
            defaultValue={editingCard?.answer || ''}
            rows={3}
            required
            disabled={isPending}
          />
          <Input
            label="Subject"
            name="subject"
            defaultValue={editingCard?.subject || ''}
            required
            disabled={isPending}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              name="difficulty"
              defaultValue={editingCard?.difficulty || 'medium'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCard(null);
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
              {editingCard ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Generation Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setError(null);
        }}
        title="Generate Flashcards with AI"
      >
        <form onSubmit={handleGenerateAI} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Study Material
            </label>
            <select
              name="materialId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isPending}
            >
              <option value="">Choose a material...</option>
              {materials.map(material => (
                <option key={material._id} value={material._id}>
                  {material.title} ({material.subject})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Number of Flashcards"
            name="count"
            type="number"
            min="1"
            max="10"
            defaultValue="5"
            required
            disabled={isPending}
          />
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-900">
              ✨ AI will analyze your study material and generate relevant flashcards automatically!
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAIModalOpen(false);
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
              Generate Flashcards
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}