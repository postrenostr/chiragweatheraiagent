import axios from "axios";
import React, { useState } from "react";

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    // Add user message to the chat
    const userMessage = { sender: "User", text: input };
    setMessages([...messages, userMessage]);

    try {
      // Send user message to the server
      const response = await axios.post("http://13.60.22.232:8080/ask-ai", {
        input: input,
      });

      // Add AI response to the chat
      const aiMessage = { sender: "AI", text: response.data.answer };
      setMessages([...messages, userMessage, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        sender: "AI",
        text: "Error fetching response from AI",
      };
      setMessages([...messages, userMessage, errorMessage]);
    }

    // Clear the input field
    setInput("");
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Chat with AI</h5>
        </div>
        <div
          className="card-body chat-box"
          style={{ height: "400px", overflowY: "scroll" }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-3 ${
                message.sender === "User" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`badge bg-${
                  message.sender === "User" ? "primary" : "success"
                }`}
              >
                {message.sender}: {message.text}
              </span>
            </div>
          ))}
        </div>
        <div className="card-footer">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <div className="input-group-append">
              <button className="btn btn-primary" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
