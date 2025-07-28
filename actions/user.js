"use server";

import { db } from "../lib/inngest/prisma";
import { auth } from "@clerk/nextjs/server";
import { DemandLevel, MarketOutlook } from "@prisma/client";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if database is available
    if (!db) {
        console.warn('Database not available, skipping user update');
        throw new Error("Database connection not available");
    }

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) throw new Error("User not found");

    try {
        const result = await db.$transaction(
            async (tx) => {
                // First check if industry exists
                let industryInsight = await tx.industryInsight.findUnique({
                    where: {
                        industry: data.industry,
                    },
                })

                // If industry doesn't exist, create it with default values
                if (!industryInsight) {
                    console.log(`Creating industry insights for: ${data.industry}`);
                    const insights = await generateAIInsights(data.industry);

                    industryInsight = await tx.industryInsight.create({
                        data: {
                            industry: data.industry,
                            ...insights,
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        },
                    });
                    console.log(`Industry insights created successfully for: ${data.industry}`);
                }

                // Now update the user
                const updatedUser = await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        industry: data.industry,
                        experience: data.experience,
                        bio: data.bio,
                        skills: data.skills,
                    }
                });

                console.log(`User updated successfully: ${user.id}`);
                return { updatedUser, industryInsight };
            },
            {
                timeout: 15000, // Increased timeout
            });
        return { success: true, ...result };
    }
    catch (error) {
        console.error("Error in updating user and industry insights:", error.message);
        console.error("Full error:", error);
        throw new Error("Failed to update profile: " + error.message);
    }
}

export async function getUserOnboardingStatus(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if database is available
    if (!db) {
        console.warn('Database not available, returning default onboarding status');
        return { isOnboarded: false };
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                industry: true,
            }
        });

        if (!user) {
            console.log("User not found in database, returning not onboarded");
            return { isOnboarded: false };
        }

        return {
            isOnboarded: !!user?.industry,
        };
    } catch (error) {
        console.error("Error checking onboarding status:", error.message);
        // Return false instead of throwing to allow the app to continue
        return { isOnboarded: false };
    }
}


