import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const model = new OpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0.9,
  apiKey: "sk-proj-WEGFqVKFOCLzFPmvaNMOT3BlbkFJQObN9p96DvVNQbOeM399",
});

export async function generateQuestions() {
  try {
    const prompt = `
      create a list of suggested questions for a chatbot that its main role is to help with frontend development
      of this format:
      ["question1", "question2", "question3", "question4", "question5"]

      NOTE : minimum 3 questions
    `;

    const res = await model.invoke(prompt);
    console.log("Generated questions:", res);

    return res;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

const frontendPromptTemplate = PromptTemplate.fromTemplate(`
You're a chatbot assistant that helps users with frontend development.  You should answer user question about frontend development.
  If the user question is not related to frontend development or related to different stack like backend, please ask the user to ask a question related to frontend development,
  and then answer the user question.
  User question:
  {userQuestion}
`);

async function formatFrontendPrompt(query) {
  return frontendPromptTemplate.format({ userQuestion: query });
}

async function getFrontendAnswer(formattedPrompt) {
  return model.invoke(formattedPrompt);
}

export async function userQuestionAnswer(query) {
  console.log("User query:", query);
  const userQuestion = query.question;
  try {
    const formattedPrompt = await formatFrontendPrompt(userQuestion);
    console.log("Formatted prompt:", formattedPrompt);
    const res = await getFrontendAnswer(formattedPrompt);
    console.log("Generated answer:", res);
    return res;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

const filePromptTemplate = PromptTemplate.fromTemplate(`
  Summarize the following text as it's a file content. You will respond with a JSON object that contains the summary of the file content and the Key Phrases of the file content. Finally, provide the Sentiment of the file content:
  This is the format:
  {
      "summary": "summary of the file content",
      "keyPhrases": ["keyPhrase1", "keyPhrase2", "keyPhrase3"],
      "sentiment": "sentiment of the file content"
  }
  {fileContent}
`);

async function formatFilePrompt(query) {
  return filePromptTemplate.format({ fileContent: query });
}

async function getFileAnswer(formattedPrompt) {
  return model.invoke(formattedPrompt);
}

export async function fileSummary(fileContent) {
  try {
    const formattedPrompt = await formatFilePrompt(fileContent);
    console.log("Formatted prompt:", formattedPrompt);
    const res = await getFileAnswer(formattedPrompt);
    console.log("Generated summary:", res);
    return res;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}
