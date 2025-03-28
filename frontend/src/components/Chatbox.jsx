import React, { useState } from 'react';
import './Chatbox.css';

function Chatbox() {
  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng chatbox
  const [message, setMessage] = useState(''); // Tin nhắn người dùng nhập
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Không gửi tin nhắn rỗng

    // Thêm tin nhắn của người dùng vào danh sách
    setMessages([...messages, { text: message, sender: 'user' }]);
    setMessage('');

    // Giả lập phản hồi từ hệ thống
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm.', sender: 'system' },
      ]);
    }, 1000);
  };

  return (
    <div className="chatbox-container">
      {/* Nút mở/đóng chatbox */}
      {!isOpen && (
        <button className="chatbox-toggle" onClick={toggleChatbox}>
          Chat với chúng tôi
        </button>
      )}

      {/* Chatbox khi mở */}
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <h3>Chat với chúng tôi</h3>
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
          <form className="chatbox-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbox;