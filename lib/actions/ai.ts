'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Material from '@/lib/db/models/Material';
import Flashcard from '@/lib/db/models/Flashcard';
import { getCurrentUser } from './auth';
import { generateSummary, generateFlashcards } from '@/lib/ai/gemini';

export async function generateAISummary(materialId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    const material = await Material.findOne({
      _id: materialId,
      userId: user.id,
    });

    if (!material) {
      return { success: false, error: 'Material not found' };
    }

    const summary = await generateSummary(material.content);

    material.aiSummary = summary;
    await material.save();

    revalidatePath('/materials');

    return {
      success: true,
      message: 'Summary generated successfully',
      data: { summary },
    };
  } catch (error: any) {
    console.error('Generate summary error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate summary',
    };
  }
}

export async function generateAIFlashcards(materialId: string, count: number = 5) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    const material = await Material.findOne({
      _id: materialId,
      userId: user.id,
    });

    if (!material) {
      return { success: false, error: 'Material not found' };
    }

    const flashcardsData = await generateFlashcards(material.content, count);

    const savedFlashcards = await Flashcard.insertMany(
      flashcardsData.map((fc: any) => ({
        userId: user.id,
        materialId: material._id,
        question: fc.question,
        answer: fc.answer,
        subject: material.subject,
        difficulty: 'medium',
        isAIGenerated: true,
      }))
    );

    revalidatePath('/flashcards');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Generated ${savedFlashcards.length} flashcards successfully`,
      data: {
        count: savedFlashcards.length,
        flashcards: savedFlashcards.map((f) => ({
          _id: f._id.toString(),
          question: f.question,
          answer: f.answer,
        })),
      },
    };
  } catch (error: any) {
    console.error('Generate flashcards error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate flashcards',
    };
  }
}