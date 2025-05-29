// src/components/ui/sheet.tsx
import *_React from 'react'; // Circumvent "React not used" error if only types are used in some placeholders

// Minimal Sheet component placeholders
export const Sheet = ({ children, ...props }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode; [key: string]: any; }) => (
  <div {...props} data-testid="sheet-placeholder">{children}</div>
);
export const SheetTrigger = ({ children, ...props }: { children: React.ReactNode; [key: string]: any; }) => (
  <button {...props} data-testid="sheet-trigger-placeholder">{children}</button>
);
export const SheetClose = ({ children, ...props }: { children: React.ReactNode; [key: string]: any; }) => (
  <button {...props} data-testid="sheet-close-placeholder">{children}</button>
);
export const SheetContent = ({ children, side = "right", ...props }: { side?: "top" | "bottom" | "left" | "right"; children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <div {...props} data-side={side} data-testid="sheet-content-placeholder" style={{ border: '1px solid #ccc', padding: '10px', position: 'fixed', [side]: 0, top: 0, height: '100%', backgroundColor: 'white', zIndex: 1000, minWidth: '300px' }} > {/* Basic styling for visibility */}
    {children}
  </div>
);
export const SheetHeader = ({ children, ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <div {...props} data-testid="sheet-header-placeholder">{children}</div>
);
export const SheetTitle = ({ children, ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <h2 {...props} data-testid="sheet-title-placeholder">{children}</h2>
);
export const SheetDescription = ({ children, ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <p {...props} data-testid="sheet-description-placeholder">{children}</p>
);
export const SheetFooter = ({ children, ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <div {...props} data-testid="sheet-footer-placeholder">{children}</div>
);
