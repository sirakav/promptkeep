// __mocks__/@radix-ui/react-dialog.js
import React from 'react';

export const Dialog = ({ children, open }) => open ? <div data-testid="mock-dialog">{children}</div> : null;
export const DialogTrigger = React.forwardRef(({ children, ...props }, ref) => <button ref={ref} {...props} data-testid="mock-dialog-trigger">{children}</button>);
export const DialogPortal = ({ children }) => <>{children}</>; // Simplified
export const DialogOverlay = React.forwardRef((props, ref) => <div ref={ref} {...props} data-testid="mock-dialog-overlay" />);
export const DialogContent = React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-dialog-content">{children}</div>);
export const DialogHeader = React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-dialog-header">{children}</div>);
export const DialogTitle = React.forwardRef(({ children, ...props }, ref) => <h2 ref={ref} {...props} data-testid="mock-dialog-title">{children}</h2>);
export const DialogDescription = React.forwardRef(({ children, ...props }, ref) => <p ref={ref} {...props} data-testid="mock-dialog-description">{children}</p>);
export const DialogFooter = React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-dialog-footer">{children}</div>);
export const DialogClose = React.forwardRef(({ children, ...props }, ref) => <button ref={ref} {...props} data-testid="mock-dialog-close">{children}</button>);
