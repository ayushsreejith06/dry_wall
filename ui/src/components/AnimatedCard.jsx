import { useState } from 'react';
import './AnimatedCard.css';

export default function AnimatedCard({ 
  children, 
  className = '',
  hoverable = true,
  delay = 0
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`animated-card ${hoverable ? 'hoverable' : ''} ${isHovered ? 'hovered' : ''} ${className}`}
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => hoverable && setIsHovered(false)}
      style={{ '--delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
}


