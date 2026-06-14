import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your Saplinggo assistant. How can I help you with your plants today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', { message: userMessage.content });
      setMessages(prev => [...prev, { role: 'bot', content: response.data.response }]);
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-widget">
      {!isOpen ? (
        <button className="chat-btn animate-float" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      ) : (
        <div className="chat-window glass">
          <div className="chat-header">
            <span>Saplinggo Assistant</span>
            <button className="close-chat" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role === 'user' ? 'message-user' : 'message-bot'}`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message message-bot">
                <span className="animate-pulse">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about plants..."
            />
            <button className="chat-send" onClick={handleSend} disabled={isLoading}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
