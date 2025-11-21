import { useState, useRef, useEffect } from 'react';
import './SimpleSlider.css';

const SimpleSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = '',
  label = '',
  showValue = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleMouseDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    handleMove(e);
  };

  const handleMove = (e) => {
    if (!sliderRef.current || disabled) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    setDisplayValue(clampedValue);
    if (onChange) {
      onChange(clampedValue);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleMove(e);
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, step, onChange, disabled]);

  const percentage = ((displayValue - min) / (max - min)) * 100;

  return (
    <div className={`simple-slider-container ${className} ${disabled ? 'disabled' : ''}`}>
      {label && <label className="simple-slider-label">{label}</label>}
      <div className="simple-slider-wrapper">
        <div
          ref={sliderRef}
          className="simple-slider-track"
          onMouseDown={handleMouseDown}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <div
            className="simple-slider-fill"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="simple-slider-thumb"
            style={{ left: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <span className="simple-slider-value">{Math.round(displayValue)}</span>
        )}
      </div>
    </div>
  );
};

export default SimpleSlider;

