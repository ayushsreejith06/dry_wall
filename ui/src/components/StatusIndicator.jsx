import './StatusIndicator.css';

export default function StatusIndicator({ 
  status = 'idle', 
  label,
  pulse = true,
  className = '' 
}) {
  const statusClass = status === 'connected' || status === 'active' || status === 'completed' 
    ? 'active' 
    : status === 'error' || status === 'failed' 
    ? 'error' 
    : 'idle';
  
  // Don't pulse for completed status
  const shouldPulse = pulse && statusClass === 'active' && status !== 'completed';

  return (
    <div className={`status-indicator ${statusClass} ${shouldPulse ? 'pulse' : ''} ${className}`}>
      <span className="status-dot"></span>
      {label && <span className="status-label">{label}</span>}
    </div>
  );
}

