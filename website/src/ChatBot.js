import React, { useState } from 'react';
import './ChatBot.css';

function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: 'TAND', text: '어디로 떠나고 싶어?', time: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: 'User', text: input, time: new Date().toLocaleTimeString() }]);
      setInput('');
    }
  };

  return (
    <div className="chat-bot">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <span className="chat-time">{msg.time}</span>
            <span className="chat-text">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메세지를 입력하세요..."
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
}

export default ChatBot;
