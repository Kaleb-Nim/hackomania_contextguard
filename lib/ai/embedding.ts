import { genAI } from "./client";

const EMBEDDING_MODEL = "gemini-embedding-001";

/**
 * Generate a 768-dimensional embedding for a text string
 * using Gemini's embedding model.
 */
export async function embedText(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

    const result = await model.embedContent(text);
    return result.embedding.values;
}
