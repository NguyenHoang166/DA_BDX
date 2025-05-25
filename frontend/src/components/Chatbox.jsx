import React, { useState } from 'react';
import './Chatbox.css';

function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages([...messages, { text: message, sender: 'user' }]);
    const userMessage = message;
    setMessage('');

    try {
      const token = null; // Thay bằng localStorage.getItem('token') nếu có
      console.log('Gửi yêu cầu với token:', token);
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Lỗi từ API:', errorData);
        throw new Error(errorData.error || 'Lỗi khi gọi API');
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.reply, sender: 'system' },
      ]);
    } catch (error) {
      console.error('Lỗi:', error.message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: error.message, sender: 'system' },
      ]);
    }
  };

  return (
    <div className="chatbox-container">
      {!isOpen && (
        <button className="chatbox-toggle" onClick={toggleChatbox}>
          🤖
        </button>
      )}
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <h3>Chatbot của chúng tôi</h3>
            <button className="chatbox-close" onClick={toggleChatbox}>
              ✕
            </button>
          </div>
          <div className="chatbox-body">
            {messages.length === 0 ? (
              <p>Chào bạn! Chúng tôi có thể giúp gì cho bạn?</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chatbox-message ${
                    msg.sender === 'user' ? 'user-message' : 'system-message'
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>
          <div className="chatbox-form">
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit">Gửi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbox;	