import React from 'react';
import StatusIndicator from './StatusIndicator';
import AnimatedButton from './AnimatedButton';
import ChatComponent from './react-bits/ChatComponent';
import CollapsiblePanel from './react-bits/CollapsiblePanel';
import './AutoModePanel.css';

function TasksPanel({ currentTask, tasks }) {
  const taskList = tasks || [
    { id: 1, name: 'Move to position A', status: 'completed' },
    { id: 2, name: currentTask || 'Installing drywall panel', status: 'active' },
    { id: 3, name: 'Return to base', status: 'pending' },
  ];

  const completedCount = taskList.filter(t => t.status === 'completed').length;
  const totalCount = taskList.length;

  return (
    <CollapsiblePanel
      title={`${completedCount} of ${totalCount} To-dos Completed`}
      defaultOpen={false}
      className="tasks-panel"
    >
      <div className="tasks-content">
        {taskList.map((task) => (
          <div key={task.id} className={`task-item ${task.status}`}>
            <StatusIndicator
              status={task.status === 'completed' ? 'completed' : task.status === 'active' ? 'active' : 'idle'}
              label={task.name}
              pulse={task.status === 'active'}
              className="task-status"
            />
          </div>
        ))}
      </div>
    </CollapsiblePanel>
  );
}

function ControlButtons({ onPause, onPlay, onPowerOff, isPaused }) {
  return (
    <div className="control-buttons-container">
      <AnimatedButton
        variant="secondary"
        size="large"
        onClick={onPause}
        disabled={isPaused}
        className="control-button pause-button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>Pause</span>
      </AnimatedButton>
      <AnimatedButton
        variant="primary"
        size="large"
        onClick={onPlay}
        disabled={!isPaused}
        className="control-button start-button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Start</span>
      </AnimatedButton>
      <AnimatedButton
        variant="secondary"
        size="large"
        onClick={onPowerOff}
        className="control-button power-button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
        <span>Power Off</span>
      </AnimatedButton>
    </div>
  );
}

export default function AutoModePanel({ onSendMessage, currentTask, tasks, onPause, onPlay, onPowerOff, isPaused }) {
  return (
    <div className="auto-mode-panel">
      <div className="auto-mode-left">
        <ChatComponent onSendMessage={onSendMessage} />
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

