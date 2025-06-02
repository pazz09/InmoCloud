'use client';

import { Alert, CloseButton } from 'react-bootstrap';

type TimedError = {
  id: number;
  message: string;
};

type ErrorAlertsProps = {
  errors: TimedError[];
  onDismiss: (id: number) => void;
};

export default function ErrorAlerts({ errors, onDismiss }: ErrorAlertsProps) {
  if (errors.length === 0) return null;

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
      {errors.map((error) => (
        <Alert
          key={error.id}
          variant="danger"
          className="mb-2 text-center fade show d-flex justify-content-between align-items-center"
          style={{ pointerEvents: 'auto' }}
        >
          <span className="flex-grow-1">{error.message}</span>
          <CloseButton onClick={() => onDismiss(error.id)} />
        </Alert>
      ))}
    </div>
  );
}
