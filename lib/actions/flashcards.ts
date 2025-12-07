'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Flashcard from '@/lib/db/models/Flashcard';
import { getCurrentUser } from './auth';
import { z } from 'zod';

const flashcardSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(500),
  answer: z.string().min(1, 'Answer is required').max(1000),
  subject: z.string().min(1, 'Subject is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  materialId: z.string().optional().nullable().transform(val => val || undefined),
});

export async function getFlashcards(subject?: string, materialId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    const query: any = { userId: user.id };

    if (subject) {
      query.subject = subject;
    }

    if (materialId) {
      query.materialId = materialId;
    }

    const flashcards = await Flashcard.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: flashcards.map((f) => ({
        ...f,
        _id: f._id.toString(),
        userId: f.userId.toString(),
        materialId: f.materialId?.toString(),
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
        lastReviewed: f.lastReviewed?.toISOString(),
        nextReview: f.nextReview?.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Get flashcards error:', error);
    return { success: false, error: 'Failed to fetch flashcards' };
  }
}

export async function createFlashcard(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
      question: formData.get('question'),
      answer: formData.get('answer'),
      subject: formData.get('subject'),
      difficulty: formData.get('difficulty') || 'medium',
      materialId: formData.get('materialId'),
    };

    const validated = flashcardSchema.parse(rawData);

    await connectDB();

    const flashcard = await Flashcard.create({
      userId: user.id,
      question: validated.question,
      answer: validated.answer,
      subject: validated.subject,
      difficulty: validated.difficulty || 'medium',
      materialId: validated.materialId,
      isAIGenerated: false,
    });

    revalidatePath('/flashcards');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Flashcard created successfully',
      data: {
        _id: flashcard._id.toString(),
      },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    console.error('Create flashcard error:', error);
    return { success: false, error: 'Failed to create flashcard' };
  }
}

export async function updateFlashcard(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
      question: formData.get('question'),
      answer: formData.get('answer'),
      subject: formData.get('subject'),
      difficulty: formData.get('difficulty') || 'medium',
      materialId: null,
    };

    const validated = flashcardSchema.parse(rawData);

    await connectDB();

    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: id, userId: user.id },
      {
        $set: {
          question: validated.question,
          answer: validated.answer,
          subject: validated.subject,
          difficulty: validated.difficulty,
        },
      },
      { new: true, runValidators: true }
    );

    if (!flashcard) {
      return { success: false, error: 'Flashcard not found' };
    }

    revalidatePath('/flashcards');

    return { success: true, message: 'Flashcard updated successfully' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    console.error('Update flashcard error:', error);
    return { success: false, error: 'Failed to update flashcard' };
  }
}

export async function deleteFlashcard(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    const flashcard = await Flashcard.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!flashcard) {
      return { success: false, error: 'Flashcard not found' };
    }

    revalidatePath('/flashcards');
    revalidatePath('/dashboard');

    return { success: true, message: 'Flashcard deleted successfully' };
  } catch (error) {
    console.error('Delete flashcard error:', error);
    return { success: false, error: 'Failed to delete flashcard' };
  }
}