/**
 * Groq AI Service for BuildWave Project Brief Generation
 * Uses Groq API (llama-3.3-70b-versatile / llama3-8b-8192) for ultra-fast response generation
 */

export interface ProjectBriefInput {
  title: string;
  discipline: string;
  level: string;
  requirements?: string;
}

export const generateProjectBriefWithGroq = async (input: ProjectBriefInput): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const prompt = `You are an expert academic project advisor at BuildWave.
Generate a structured, highly professional academic project description for:
- Title / Topic: "${input.title || "Academic Engineering / Software Project"}"
- Discipline / Field: "${input.discipline || "Computer Science / Engineering"}"
- Academic Level: "${input.level || "Undergraduate / Postgraduate"}"
${input.requirements ? `- Specific Requirements: "${input.requirements}"` : ""}

Format your response cleanly with clear section headings:
1. Executive Summary & Objective
2. Key Academic Methodologies & Tools
3. Expected Deliverables & Outcomes
4. Evaluation & Documentation Standard

Keep it clear, academic, structured, and realistic.`;

  if (apiKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a professional academic project advisor. Write clean, structured project briefs.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return content;
        }
      } else {
        console.warn("Groq API returned status:", response.status);
      }
    } catch (error) {
      console.error("Groq API call error, using fallback generator:", error);
    }
  }

  // Graceful fallback generator if Groq API key is absent or request fails
  const topic = input.title || "Custom Project Implementation";
  const discipline = input.discipline || "Computer Science / Engineering";
  const level = input.level || "Undergraduate";

  return `📌 EXECUTIVE SUMMARY & OBJECTIVE:
This project focuses on "${topic}" within the domain of ${discipline}. Designed to meet ${level}-level academic standards, the primary objective is to implement a robust, end-to-end working system accompanied by complete technical documentation and source code.

🛠️ KEY METHODOLOGIES & TECH STACK:
- Architecture Design & Modular Implementation
- Rigorous Testing, Validation & Performance Optimization
- Clean Code Practices & Comprehensive Documentation

 deliverables & OUTCOMES:
1. Fully functional, tested source code repository with installation instructions.
2. Complete Academic Final Report (PDF format including diagrams, analysis, and references).
3. Presentation Slides & System Demonstration Video/Walkthrough.

📊 EVALUATION & STANDARDS:
Adheres strictly to academic university guidelines, ensuring zero plagiarism, proper citations, and verified implementation results.`;
};
