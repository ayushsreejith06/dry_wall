import React, { useState, useRef, useEffect } from 'react';
import './AutoModePanel.css';

function ChatBot({ onSendMessage }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I\'m your robot assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I understand. Let me process that instruction...'
      };
      setMessages(prev => [...prev, botMessage]);
      if (onSendMessage) {
        onSendMessage(inputValue);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <span className="chatbot-icon">🤖</span>
          <span>Robot Assistant</span>
        </div>
        <div className="chatbot-status">
          <span className="status-dot"></span>
          <span>Online</span>
        </div>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.type}`}>
            <div className="message-bubble">
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input-container">
        <input
          type="text"
          className="chatbot-input"
          placeholder="Type your instruction..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="chatbot-send-button" onClick={handleSend}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

function TasksPanel({ currentTask, tasks }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setExpandedHeight(contentRef.current.scrollHeight);
    } else {
      setExpandedHeight(0);
    }
  }, [isExpanded, tasks]);

  const taskList = tasks || [
    { id: 1, name: 'Move to position A', status: 'completed' },
    { id: 2, name: currentTask || 'Installing drywall panel', status: 'active' },
    { id: 3, name: 'Return to base', status: 'pending' },
  ];

  const completedCount = taskList.filter(t => t.status === 'completed').length;
  const totalCount = taskList.length;

  return (
    <div className="tasks-panel">
      <button
        className="tasks-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="tasks-button-content">
          <span className="tasks-header">
            {completedCount} of {totalCount} To-dos Completed
          </span>
        </div>
        <svg
          className={`tasks-arrow ${isExpanded ? 'expanded' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div
        className="tasks-dropdown"
        style={{
          maxHeight: `${expandedHeight}px`,
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none',
        }}
      >
        <div ref={contentRef} className="tasks-content">
          {taskList.map((task) => (
            <div key={task.id} className={`task-item ${task.status}`}>
              {task.status === 'completed' ? (
                <div className="task-checkmark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              ) : (
                <div className="task-status-indicator"></div>
              )}
              <span className="task-name">{task.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ControlButtons({ onPause, onPlay, onPowerOff, isPaused }) {
  return (
    <div className="control-buttons-container">
      <button
        className="control-button pause-button"
        onClick={onPause}
        disabled={isPaused}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>Pause</span>
      </button>
      <button
        className="control-button play-button"
        onClick={onPlay}
        disabled={!isPaused}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Play</span>
      </button>
      <button
        className="control-button power-button"
        onClick={onPowerOff}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
        <span>Power Off</span>
      </button>
    </div>
  );
}

export default function AutoModePanel({ onSendMessage, currentTask, tasks, onPause, onPlay, onPowerOff, isPaused }) {
  return (
    <div className="auto-mode-panel">
      <div className="auto-mode-left">
        <ChatBot onSendMessage={onSendMessage} />
      </div>
      <div className="auto-mode-right">
        <div className="auto-mode-right-split">
          <div className="auto-mode-right-left">
            <TasksPanel currentTask={currentTask} tasks={tasks} />
            <div className="control-buttons-wrapper">
              <ControlButtons
                onPause={onPause}
                onPlay={onPlay}
                onPowerOff={onPowerOff}
                isPaused={isPaused}
              />
            </div>
          </div>
          <div className="auto-mode-right-right">
            {/* Right side can be used for additional info or left empty */}
          </div>
        </div>
      </div>
    </div>
  );
}

