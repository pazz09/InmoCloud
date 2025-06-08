'use client';

import { Alert, CloseButton } from 'react-bootstrap';

export type TimedAlert = {
  id: number;
  message: string;
  type: 'error' | 'success'
};

type TimedAlertsProps = {
  alerts: TimedAlert[];
  onDismiss: (id: number) => void;
};

export default function TimedAlerts({ alerts, onDismiss }: TimedAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1050,
        width: '100%',
        maxWidth: '500px',
        pointerEvents: 'none',
      }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.type === 'error' ? 'danger' : alert.type}
          className="mb-2 text-center fade show d-flex justify-content-between align-items-center"
          style={{ pointerEvents: 'auto' }}
        >
          <span className="flex-grow-1">{alert.message}</span>
          <CloseButton onClick={() => onDismiss(alert.id)} />
        </Alert>
      ))}
    </div>
  );
}
