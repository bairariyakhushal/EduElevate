// src/services/operations/aiAPI.js - Frontend version (React)

import { apiConnector } from "../apiConnector";
import { aiEndpoints } from "../apis";

const { CHAT_WITH_AI_API, GET_CHAT_SUGGESTIONS_API } = aiEndpoints;

// Get chat suggestions (Protected)
export const getChatSuggestions = (token) => {
  return async (dispatch) => {
    try {
      console.log("Making suggestions API call with token:", token?.substring(0, 20) + "...");
      
      const response = await apiConnector("GET", GET_CHAT_SUGGESTIONS_API, null, {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      });

      console.log("Suggestions API Response:", response);

      if (response?.data?.success) {
        return response.data.data.suggestions;
      } else {
        throw new Error(response?.data?.message || "Failed to load suggestions");
      }
    } catch (error) {
      console.error("GET_CHAT_SUGGESTIONS_API ERROR:", error);
      console.error("Error response:", error.response?.data);
      
      // Return default suggestions as fallback
      return [
        "How can I improve my study habits?",
        "What are effective note-taking strategies?",
        "How do I prepare for exams effectively?",
        "Can you help me create a study schedule?",
        "What are some time management tips for students?",
        "How can I stay motivated while learning?"
      ];
    }
  };
};

// Chat with AI (Protected)
export const chatWithAI = (message, conversationHistory = []) => {
  return async (dispatch, getState) => {
    try {
      const { auth } = getState();
      const token = auth?.token;

      console.log("Chat API call with token:", token?.substring(0, 20) + "...");

      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!message?.trim()) {
        throw new Error("Message is required");
      }

      const response = await apiConnector(
        "POST",
        CHAT_WITH_AI_API,
        { 
          message: message.trim(), 
          conversationHistory 
        },
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      );

      console.log("Chat API Response:", response);

      if (response?.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response?.data?.message || "Failed to get AI response");
      }
    } catch (error) {
      console.error("CHAT_WITH_AI_API ERROR:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  };
};