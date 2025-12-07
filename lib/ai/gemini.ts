import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY!;

if (!API_KEY) {
  throw new Error('Define GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateSummary(content: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Please provide a concise summary of the following study material. 
    Focus on key concepts, main ideas, and important details. Keep it under 200 words.
    
    Study Material:
    ${content}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate summary');
  }
}

export async function generateFlashcards(content: string, count: number = 5) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Based on the following study material, generate ${count} flashcard questions and answers.
    Format your response as a JSON array with objects containing 'question' and 'answer' fields.
    Make questions clear, concise, and test understanding of key concepts.
    
    Study Material:
    ${content}
    
    Return only valid JSON, no additional text.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const flashcards = JSON.parse(jsonMatch[0]);
    return flashcards;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate flashcards');
  }
}

export async function explainConcept(context: string, question: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a helpful study assistant. Based on the following study material context, 
    answer the user's question clearly and concisely. Use examples and analogies where appropriate.
    
    Context:
    ${context}
    
    Question:
    ${question}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to explain concept');
  }
}

export default genAI;