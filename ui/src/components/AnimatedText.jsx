import { useEffect, useRef, useState } from 'react';
import './AnimatedText.css';

export default function AnimatedText({ 
  children, 
  variant = 'fade-up', 
  delay = 0,
  duration = 0.6,
  className = '',
  as: Component = 'div'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay * 1000);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <Component
      ref={elementRef}
      className={`animated-text ${variant} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ '--duration': `${duration}s` }}
    >
      {children}
    </Component>
  );
}


