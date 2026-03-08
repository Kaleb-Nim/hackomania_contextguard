import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ?? ""
);

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
