const express = require("express");
const router = express.Router();

// Import controllers
const aiController = require("../controllers/ai");
console.log("AI Controller exports:", aiController); // Add this debug line
console.log("getChatSuggestions:", aiController.getChatSuggestions); // Add this debug line

const { chatWithAI, getChatSuggestions } = aiController;

// Import middleware
const { auth } = require("../middlewares/auth");

// Routes for AI functionality
router.post("/chat", auth, chatWithAI);
router.get("/suggestions", auth, getChatSuggestions);

module.exports = router;