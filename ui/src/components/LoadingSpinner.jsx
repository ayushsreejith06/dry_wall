import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'medium', className = '' }) {
  return (
    <div className={`loading-spinner ${size} ${className}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
  );
}


