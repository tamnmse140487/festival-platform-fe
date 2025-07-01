import React from 'react';

const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = true,
  shadow = true,
  border = true,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl';
  const shadowClass = shadow ? 'shadow-sm' : '';
  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'hover:shadow-md transition-shadow' : '';
  const paddingClass = padding ? 'p-6' : '';

  return (
    <div 
      className={`${baseClasses} ${shadowClass} ${borderClass} ${hoverClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-gray-600 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;