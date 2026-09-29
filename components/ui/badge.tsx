import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={`inline-flex items-center justify-center font-medium ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const badgeVariants = () => '';
