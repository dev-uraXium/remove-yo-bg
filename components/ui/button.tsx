import React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
    size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm';
  }
>(({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
  return <button ref={ref} data-variant={variant} data-size={size} className={className} {...props} />;
});
Button.displayName = 'Button';

export const buttonVariants = () => '';
