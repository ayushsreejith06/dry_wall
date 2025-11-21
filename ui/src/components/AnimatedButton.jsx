import { useState } from 'react';
import './AnimatedButton.css';

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type={type}
      className={`animated-button ${variant} ${size} ${className} ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      <span className="button-content">{children}</span>
      <span className="button-shine"></span>
    </button>
  );
}


