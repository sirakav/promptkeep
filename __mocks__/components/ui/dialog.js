// __mocks__/components/ui/dialog.js
import React from 'react';

export const Dialog = ({ children, open }) => open ? <div data-testid="mock-dialog-wrapper">{children}</div> : null;
export const DialogTrigger = React.forwardRef(({ children, ...props }, ref) => <button ref={ref} {...props} data-testid="mock-dialog-trigger-wrapper">{children}</button>);
export const DialogPortal = ({ children }) => <div data-testid="mock-dialog-portal-wrapper">{children}</div>; // Changed to div for consistency
export const DialogOverlay = React.forwardRef((props, ref) => <div ref={ref} {...props} data-testid="mock-dialog-overlay-wrapper" />);
export const DialogContent = React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-dialog-content-wrapper">{children}</div>);
export const DialogHeader = React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-dialog-header-wrapper">{children}</div>);
export const DialogTitle = React.forwardRef(({ children, ...props }, ref) => <h2 ref={ref} {...props} data-testid="mock-dialog-title-wrapper">{children}</h2>);
export const DialogDescription = React.forwardRef(({ children, ...props }, ref) => <p ref={ref} {...props} data-testid="mock-dialog-description-wrapper">{children}</p>);
export const DialogFooter = React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-dialog-footer-wrapper">{children}</div>);
export const DialogClose = React.forwardRef(({ children, ...props }, ref) => <button ref={ref} {...props} data-testid="mock-dialog-close-wrapper">{children}</button>);
