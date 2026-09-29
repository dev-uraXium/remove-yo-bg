import React, { useState } from 'react';

export const TooltipProvider: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
}) => {
  return <>{children}</>;
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ isVisible?: boolean }>, {
          isVisible: visible,
        });
      })}
    </div>
  );
};

export interface TooltipTriggerProps {
  children?: React.ReactNode;
  render?: React.ReactNode;
  asChild?: boolean;
  className?: string;
  isVisible?: boolean;
}

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
  children,
  render,
  className = '',
}) => {
  return <div className={`inline-flex ${className}`}>{render || children}</div>;
};

export const TooltipContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  isVisible?: boolean;
}> = ({ children, className = '', side = 'top', isVisible }) => {
  if (!isVisible) return null;

  const positionClasses =
    side === 'bottom'
      ? 'top-full mt-2'
      : side === 'left'
      ? 'right-full mr-2'
      : side === 'right'
      ? 'left-full ml-2'
      : 'bottom-full mb-2';

  return (
    <div
      role="tooltip"
      className={`absolute ${positionClasses} left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 text-[11px] font-medium text-[#171717] bg-[#F6DFA6] rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${className}`}
    >
      {children}
    </div>
  );
};
