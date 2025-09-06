import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSend, FiRefreshCw, FiMessageSquare, FiUser, FiCpu } from 'react-icons/fi';
import { chatWithAI, getChatSuggestions } from '../../../../services/operations/aiAPI';

const AIChat = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load suggestions on component mount
  useEffect(() => {

    const loadSuggestions = async () => {
      try {
        console.log("Token in AIChat:", token);
        console.log("Loading suggestions...");
        
        // Fix: Pass token directly, don't wrap in object
        const suggestionsData = await dispatch(getChatSuggestions(token));
        setSuggestions(suggestionsData || []);
        console.log("Suggestions loaded:", suggestionsData);
      } catch (error) {
        console.log("Error loading suggestions:", error);
        // Set fallback suggestions
        setSuggestions([
          "How can I improve my study habits?",
          "What are effective note-taking strategies?",
          "How do I prepare for exams effectively?",
          "Can you help me create a study schedule?"
        ]);
      }
    };

    // Only load suggestions if token exists
    if (token) {
      loadSuggestions();
    }
  }, [dispatch, token]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      content: userMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const response = await dispatch(chatWithAI(userMessage, conversationHistory));
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        content: response.response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.log("Error sending message:", error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        content: "Sorry, I couldn't process your request right now. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-richblack-900 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-richblack-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-full">
            <FiMessageSquare className="text-yellow-400 text-xl" />
          </div>
          <div>
            <h2 className="text-richblack-5 text-lg font-semibold">AI Assistant</h2>
            <p className="text-richblack-300 text-sm">Ask me anything about your studies!</p>
          </div>
        </div>
        <button
          onClick={clearConversation}
          className="p-2 text-richblack-300 hover:text-richblack-5 hover:bg-richblack-700 rounded-lg transition-colors"
          title="Clear conversation"
        >
          <FiRefreshCw className="text-lg" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-yellow-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FiCpu className="text-yellow-400 text-2xl" />
            </div>
            <h3 className="text-richblack-5 text-lg font-semibold mb-2">Welcome to AI Assistant!</h3>
            <p className="text-richblack-300 mb-6">I'm here to help you with your studies. Ask me any question!</p>
            
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-richblack-300 text-sm">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-richblack-700 text-richblack-300 text-sm rounded-full hover:bg-richblack-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 p-2 bg-yellow-50 rounded-full">
                    <FiCpu className="text-yellow-400 text-sm" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-yellow-50 text-richblack-900'
                        : message.isError
                        ? 'bg-pink-900 text-pink-200'
                        : 'bg-richblack-700 text-richblack-5'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-richblack-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 p-2 bg-richblack-700 rounded-full order-2">
                    <FiUser className="text-richblack-300 text-sm" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 p-2 bg-yellow-50 rounded-full">
                  <FiCpu className="text-yellow-400 text-sm" />
                </div>
                <div className="max-w-[80%]">
                  <div className="p-3 rounded-lg bg-richblack-700 text-richblack-5">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-richblack-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-richblack-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-richblack-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-richblack-700">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 p-3 bg-richblack-700 text-richblack-5 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder-richblack-400"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-yellow-50 text-richblack-900 rounded-lg hover:bg-yellow-25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;