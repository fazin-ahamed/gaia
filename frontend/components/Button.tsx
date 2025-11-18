
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon: Icon, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gaia-dark disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gaia-accent text-white hover:bg-blue-500 focus:ring-gaia-accent',
    secondary: 'bg-gaia-light text-gaia-text hover:bg-opacity-80 focus:ring-gaia-light',
    danger: 'bg-severity-critical text-white hover:bg-red-700 focus:ring-severity-critical',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
