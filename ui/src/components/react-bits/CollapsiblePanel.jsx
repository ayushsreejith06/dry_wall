import { useState, useRef, useEffect } from 'react';
import './CollapsiblePanel.css';

const CollapsiblePanel = ({ 
  title, 
  children, 
  defaultOpen = false, 
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(defaultOpen ? 'auto' : '0px');
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setContentHeight(`${contentRef.current.scrollHeight}px`);
      } else {
        setContentHeight('0px');
      }
    }
  }, [isOpen, children]);

  return (
    <div className={`collapsible-panel ${className}`}>
      <button
        className={`collapsible-panel-header ${headerClassName} ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="collapsible-panel-title">{title}</span>
        <svg
          className={`collapsible-panel-icon ${isOpen ? 'open' : ''}`}
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
        ref={contentRef}
        className={`collapsible-panel-content ${contentClassName} ${isOpen ? 'open' : ''}`}
        style={{ maxHeight: contentHeight }}
        aria-hidden={!isOpen}
      >
        <div className="collapsible-panel-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsiblePanel;

