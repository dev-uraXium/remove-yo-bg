import React, { useState, useRef, useEffect } from 'react';

export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

export const DropdownMenuTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const DropdownMenuContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`absolute right-0 z-50 mt-2 min-w-[8rem] rounded-xl border border-[#a89f94]/20 bg-[#171717] p-1 text-[#fff4d8] shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }
> = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#fff4d8] hover:bg-white/10 text-left transition-colors cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`-mx-1 my-1 h-px bg-[#a89f94]/20 ${className}`} />
);

export const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`px-2 py-1.5 text-xs font-semibold text-[#a89f94] ${className}`} {...props}>
    {children}
  </div>
);
export const DropdownMenuCheckboxItem = DropdownMenuItem;
export const DropdownMenuRadioGroup = DropdownMenuGroup;
export const DropdownMenuRadioItem = DropdownMenuItem;
export const DropdownMenuShortcut: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', children, ...props }) => (
  <span className={`ml-auto text-[10px] tracking-widest text-[#a89f94] ${className}`} {...props}>
    {children}
  </span>
);
export const DropdownMenuSub = DropdownMenuGroup;
export const DropdownMenuSubTrigger = DropdownMenuItem;
export const DropdownMenuSubContent = DropdownMenuContent;
