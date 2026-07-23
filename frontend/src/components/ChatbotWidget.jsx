import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import api from '../api/axios';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi there! I am the StockHub AI Assistant. How can I help you with your inventory today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', text: response.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I am having trouble connecting to the server right now. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <div className="chatbot-wrapper">
      {/* Floating Action Button */}
      <button className="chatbot-fab" onClick={toggleChat} aria-label="Open Chat">
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window slide-up">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">AI</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px' }}>StockHub Assistant</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Online</p>
              </div>
            </div>
            <button className="chatbot-close" onClick={toggleChat}>
              <FiX size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.role}`}>
                <div className="chat-text">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant">
                <div className="chat-text typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask about your inventory..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading}>
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
