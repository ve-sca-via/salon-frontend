import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  headerAction,
  footer,
  className = '',
  hoverable = false,
  onClick,
}) => {
  const hoverClass = hoverable ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  
  return (
    <div 
      className={`card transition-all duration-200 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
          <div>
            {title && <h3 className="text-xl font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
