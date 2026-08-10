import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models to try in order (from newest to most reliable)
const MODELS = ["gemini-2.5-flash"];

/**
 * Generate content with automatic retry and model fallback
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - The generated response
 */
export async function generateWithFallback(prompt, options = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  let lastError;
  
  // Try each model
  for (const modelName of MODELS) {
    console.log(`Trying model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Retry logic for each model
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt}/${maxRetries} failed for ${modelName}:`, error.message);
        
        // If it's a quota error, wait and retry
        if (error.message.includes('Quota exceeded') && attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not quota error or max retries reached, try next model
        break;
      }
    }
  }
  
  // If all models failed, throw the last error
  throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Generate content with structured format
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Generation options
 * @returns {Promise<string>} - Generated response
 */
export async function generateStructuredContent(prompt, options = {}) {
  const enhancedPrompt = `${prompt}

Please provide a clear, well-structured response. Format your output appropriately for the requested content type.`;
  
  return await generateWithFallback(enhancedPrompt, options);
}