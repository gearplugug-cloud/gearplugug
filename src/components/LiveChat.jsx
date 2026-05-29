import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Headset } from 'lucide-react';
import './LiveChat.css';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi there! I'm Alex from Gear Plug Support. Need help building your kit or checking gear availability in Kampala?", 
      sender: 'bot', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Simulate support response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: Date.now() + 1,
        text: getBotResponse(input),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  const getBotResponse = (userText) => {
    const text = userText.toLowerCase();
    if (text.includes('rent') || text.includes('availability')) return "I can check that for you! Which specific dates are you looking for?";
    if (text.includes('camera') || text.includes('red') || text.includes('arri')) return "Excellent choice. Our RED and ARRI bodies are very popular. Would you like me to send you a full spec sheet for our current inventory?";
    if (text.includes('price') || text.includes('cost')) return "Our day rates are listed on the kit builder, but we offer significant discounts for 3+ day rentals. How long is your shoot?";
    return "Thanks for your message! One of our gear specialists in Kampala will be with you shortly. In the meantime, feel free to keep adding items to your kit!";
  };

  return (
    <div className="live-chat-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-info">
              <div className="status-indicator"></div>
              <h4>Alex <span className="title">| Support</span></h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>

          <div className="chat-body" ref={scrollRef}>
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="avatar">
                  {msg.sender === 'bot' ? <Headset size={14} /> : <User size={14} />}
                </div>
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="msg-time">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot">
                <div className="avatar"><Headset size={14} /></div>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="send-btn" disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button className="chat-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <span className="notification-dot"></span>}
      </button>
    </div>
  );
}
