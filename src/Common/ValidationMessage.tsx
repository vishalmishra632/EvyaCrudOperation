import React from 'react';

interface ValidationMessageProps {
  error: string | null; 
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ error }) => {
  if (!error) return null;

  return (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  );
};

export default ValidationMessage;
