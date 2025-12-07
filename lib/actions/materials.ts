'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Material from '@/lib/db/models/Material';
import { getCurrentUser } from './auth';
import { z } from 'zod';

const materialSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  subject: z.string().min(1, 'Subject is required').max(50),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  tags: z.string().optional().or(z.literal('')),
});

export async function getMaterials(search?: string, subject?: string) {
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

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const materials = await Material.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: materials.map((m) => ({
        ...m,
        _id: m._id.toString(),
        userId: m.userId.toString(),
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Get materials error:', error);
    return { success: false, error: 'Failed to fetch materials' };
  }
}

export async function getMaterial(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    const material = await Material.findOne({
      _id: id,
      userId: user.id,
    }).lean();

    if (!material) {
      return { success: false, error: 'Material not found' };
    }

    return {
      success: true,
      data: {
        ...material,
        _id: material._id.toString(),
        userId: material.userId.toString(),
        createdAt: material.createdAt.toISOString(),
        updatedAt: material.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Get material error:', error);
    return { success: false, error: 'Failed to fetch material' };
  }
}

export async function createMaterial(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
      title: formData.get('title'),
      subject: formData.get('subject'),
      content: formData.get('content'),
      tags: formData.get('tags'),
    };

    const validated = materialSchema.parse(rawData);

    const tags = validated.tags && validated.tags !== ''
      ? validated.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    await connectDB();

    const material = await Material.create({
      userId: user.id,
      title: validated.title,
      subject: validated.subject,
      content: validated.content,
      tags,
    });

    revalidatePath('/materials');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Material created successfully',
      data: {
        _id: material._id.toString(),
      },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    console.error('Create material error:', error);
    return { success: false, error: 'Failed to create material' };
  }
}

export async function updateMaterial(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const rawData = {
      title: formData.get('title'),
      subject: formData.get('subject'),
      content: formData.get('content'),
      tags: formData.get('tags'),
    };

    const validated = materialSchema.parse(rawData);

    const tags = validated.tags && validated.tags !== ''
      ? validated.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    await connectDB();

    const material = await Material.findOneAndUpdate(
      { _id: id, userId: user.id },
      {
        $set: {
          title: validated.title,
          subject: validated.subject,
          content: validated.content,
          tags,
        },
      },
      { new: true, runValidators: true }
    );

    if (!material) {
      return { success: false, error: 'Material not found' };
    }

    revalidatePath('/materials');
    revalidatePath('/dashboard');

    return { success: true, message: 'Material updated successfully' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    console.error('Update material error:', error);
    return { success: false, error: 'Failed to update material' };
  }
}

export async function deleteMaterial(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    const material = await Material.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!material) {
      return { success: false, error: 'Material not found' };
    }

    revalidatePath('/materials');
    revalidatePath('/dashboard');

    return { success: true, message: 'Material deleted successfully' };
  } catch (error) {
    console.error('Delete material error:', error);
    return { success: false, error: 'Failed to delete material' };
  }
}