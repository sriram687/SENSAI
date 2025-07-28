"use server"

import { db } from "../lib/inngest/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
})


export const generateAIInsights = async (industry) => {
    const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }

          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

    const result = await model.generateContent(prompt)
    const response = result.response;
    const text = response.text();

    const cleanedTest = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsedData = JSON.parse(cleanedTest);

    // Convert demandLevel to uppercase
    if (parsedData.demandLevel) {
        parsedData.demandLevel = parsedData.demandLevel.toUpperCase();
    }

    if (parsedData.marketOutlook) {
        parsedData.marketOutlook = parsedData.marketOutlook.toUpperCase();
    }

    return parsedData;
    // You may want to add logic here to call the model and return the result
};

export async function getIndustryInsights() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if database is available
    if (!db) {
        console.warn('Database not available, returning mock industry insights');
        return {
            industry: "general",
            salaryRanges: [],
            growthRate: 0,
            demandLevel: "MEDIUM",
            topSkills: [],
            marketOutlook: "NEUTRAL",
            keyTrends: [],
            recommendedSkills: [],
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            include:{
                industryInsight : true,
            }
        });

        if (!user) throw new Error("User not found");

        // If user doesn't have an industry set, return null
        if (!user.industry) {
            console.log("User has no industry set, cannot get insights");
            return null;
        }

        if (!user.industryInsight) {
            console.log(`Creating industry insights for user industry: ${user.industry}`);
            const insights = await generateAIInsights(user.industry);

            const industryInsight = await db.industryInsight.create({
                data: {
                    industry: user.industry,
                    ...insights,
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            console.log(`Industry insights created successfully for: ${user.industry}`);
            return industryInsight;
        }
        return user.industryInsight;
    } catch (error) {
        console.error("Error getting industry insights:", error.message);
        throw new Error("Failed to get industry insights: " + error.message);
    }
}