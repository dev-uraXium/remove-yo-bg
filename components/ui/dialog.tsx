import React, { createContext, useContext } from 'react';
import { X } from 'lucide-react';

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType>({
  open: false,
  onOpenChange: () => {},
});

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean; className?: string }> = ({
  children,
  className,
}) => {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <div className={className} onClick={() => onOpenChange(true)}>
      {children}
    </div>
  );
};

export const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const DialogClose: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <button type="button" className={className} onClick={() => onOpenChange(false)}>
      {children || <X className="w-4 h-4" />}
    </button>
  );
};

export const DialogOverlay: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { open, onOpenChange } = useContext(DialogContext);
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transition-opacity ${className}`}
      onClick={() => onOpenChange(false)}
    />
  );
};

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  className = '',
  children,
  showCloseButton = true,
  ...props
}) => {
  const { open, onOpenChange } = useContext(DialogContext);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full max-h-[90vh] overflow-y-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#a89f94] hover:text-[#fff4d8] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex flex-col space-y-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h2 className={`text-lg font-bold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h2>
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-sm text-[#a89f94] ${className}`} {...props}>
    {children}
  </p>
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex items-center justify-end gap-2 pt-2 ${className}`} {...props}>
    {children}
  </div>
);
