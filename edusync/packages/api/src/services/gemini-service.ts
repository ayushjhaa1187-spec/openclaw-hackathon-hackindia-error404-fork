import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class GeminiService {
  private static model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  /**
   * Magic Pen: Generates a professional skill listing from a simple title/draft.
   */
  static async generateSkillListing(draft: string): Promise<string> {
    try {
      const prompt = `You are a professional academic advisor at a top university. 
      A student wants to teach or swap a skill: "${draft}".
      Generate a professional, high-fidelity skill description (3-4 sentences) that highlights:
      1. Core concepts covered
      2. Prerequisites (if any)
      3. Practical learning outcomes.
      Keep it encouraging and institutional.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error (Listing):", error);
      return "Engineering a smarter peer-to-peer exchange. Master core concepts and practical implementation via the EduSync Nexus.";
    }
  }

  /**
   * Semantic Matching: Simplified vector-like matching using LLM reasoning.
   */
  static async matchSkillIntent(query: string, availableSkills: string[]): Promise<string[]> {
    try {
      const prompt = `Given the search query: "${query}"
      Identify which of these skills are semantically related, even without keyword overlap:
      [${availableSkills.join(", ")}]
      Return only the matching skills as a comma-separated list. If none match, return "None".`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text === "None" ? [] : text.split(",").map(s => s.trim());
    } catch (error) {
      console.error("Gemini Error (Matching):", error);
      return [];
    }
  }

  /**
   * Guardian AI: Safety and compliance analysis.
   */
  static async analyzeSafety(content: string): Promise<{ isSafe: boolean; reason?: string }> {
    try {
      const prompt = `Analyze the following content for academic integrity and institutional safety: "${content}".
      Check for:
      - Academic dishonesty (cheating services, buying assignments)
      - Harassment or toxicity
      - Explicit content
      Return a JSON: { "isSafe": boolean, "reason": string | null }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      return { isSafe: true }; 
    }
  }

  /**
   * Resource Semantic Match: Identifies relevant educational materials based on intent.
   */
  static async matchResourceIntent(query: string, resources: { id: string; title: string; description: string }[]): Promise<string[]> {
    try {
      const resourceContext = resources.map(r => `[ID: ${r.id}] ${r.title}: ${r.description}`).join("\n");
      const prompt = `User search query: "${query}"
      From the following list of educational resources, identify the IDs of those that are semantically related:
      ${resourceContext}
      
      Return only the matching IDs as a comma-separated list. If none match, return "None".`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      return text === "None" ? [] : text.split(",").map(id => id.trim());
    } catch (error) {
      console.error("Gemini Error (Resource Match):", error);
      return [];
    }
  }
}
