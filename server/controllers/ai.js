const OpenAI = require("openai");

// Initialize OpenAI with OpenRouter configuration
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Your app URL
    "X-Title": "EduElevate AI Assistant", // Your app name
  }
});

// Chat with AI function
exports.chatWithAI = async (req, res) => {
  try {
    console.log("=== AI Chat Request ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user);
    
    const { message, conversationHistory = [] } = req.body;
    console.log("Message : ",message);
    console.log("Convo History : ", conversationHistory);
    
    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required" 
      });
    }

    console.log("Processing message:", message);
    console.log("Conversation history length:", conversationHistory.length);

    // Build messages array with conversation history
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant for EduElevate, an educational platform. You help students with:
        - Study guidance and learning strategies
        - Course-related questions and explanations
        - Academic planning and goal setting
        - General educational support
        
        Be friendly, encouraging, and educational in your responses. If asked about topics unrelated to education, gently guide the conversation back to learning topics.`
      }
    ];

    // Add conversation history (limit to last 10 messages to manage token usage)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: "user",
      content: message
    });

    console.log("Calling OpenRouter API...");
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // OpenRouter format for GPT-3.5
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

  console.log("OpenRouter API response:", completion);

    console.log("OpenRouter API call successful");
    console.log("Usage:", completion.usage);

    const response = completion.choices[0].message.content;
    console.log("Response:", response);

    res.status(200).json({ 
      success: true, 
      data: {
        response: response,
        usage: completion.usage
      }
    });

  } catch (err) {
    console.error("=== AI Chat Error ===");
    console.error("Error:", err);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error status:", err.status);
    
    // Handle specific OpenRouter/OpenAI errors
    if (err.code === 'insufficient_quota' || err.message?.includes('quota')) {
      console.error("API quota exceeded");
      return res.status(429).json({
        success: false,
        message: "AI service temporarily unavailable. Please try again later.",
        error: "quota_exceeded"
      });
    }
    
    if (err.code === 'rate_limit_exceeded' || err.status === 429) {
      console.error("Rate limit exceeded");
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait a moment and try again.",
        error: "rate_limit"
      });
    }

    if (err.code === 'invalid_api_key' || err.status === 401) {
      console.error("Invalid API key");
      return res.status(500).json({
        success: false,
        message: "AI service configuration error",
        error: "invalid_api_key"
      });
    }

    console.error("Generic error occurred");
    res.status(500).json({ 
      success: false, 
      message: "Something went wrong with the AI service", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Get chat suggestions function
exports.getChatSuggestions = async (req, res) => {
  try {
    console.log("=== Getting Chat Suggestions ===");
    console.log("User:", req.user);

    const suggestions = [
      "How can I improve my study habits?",
      "What are effective note-taking strategies?",
      "How do I prepare for exams effectively?",
      "Can you help me create a study schedule?",
      "What's the best way to retain information?",
      "How can I stay motivated while learning?",
      "What are some time management tips for students?",
      "How do I overcome procrastination?",
      "What's the difference between active and passive learning?",
      "How can I improve my critical thinking skills?"
    ];

    console.log("Suggestions generated successfully");

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions
      }
    });
  } catch (err) {
    console.error("=== Chat Suggestions Error ===");
    console.error("Error getting chat suggestions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load suggestions",
      error: err.message
    });
  }
};