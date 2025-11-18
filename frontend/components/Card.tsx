
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gaia-med border border-gaia-light rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
