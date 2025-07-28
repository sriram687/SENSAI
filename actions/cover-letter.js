"use server";

import { db } from "../lib/inngest/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateCoverLetter(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if database is available
    if (!db) {
      throw new Error("Database not available");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${
    data.companyName
  }.

    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}

    Job Description:
    ${data.jobDescription}

    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements

    Format the letter in markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter");
  }
  } catch (error) {
    console.error("Error in generateCoverLetter:", error);
    throw new Error("Failed to generate cover letter: " + error.message);
  }
}

export async function getCoverLetters() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("No user ID found");
      return [];
    }

    // Check if database is available
    if (!db) {
      console.warn('Database not available, returning empty array');
      return [];
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      console.log("User not found in database");
      return [];
    }

    const coverLetters = await db.coverLetter.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return coverLetters || [];
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    return [];
  }
}

export async function getCoverLetter(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if database is available
    if (!db) {
      throw new Error("Database not available");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.coverLetter.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching cover letter:", error);
    throw new Error("Failed to fetch cover letter: " + error.message);
  }
}

export async function deleteCoverLetter(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if database is available
    if (!db) {
      throw new Error("Database not available");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.coverLetter.delete({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error deleting cover letter:", error);
    throw new Error("Failed to delete cover letter: " + error.message);
  }
}