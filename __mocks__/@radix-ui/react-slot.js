// __mocks__/@radix-ui/react-slot.js
import React from 'react';

// Keep the existing Slot mock
export const Slot = React.forwardRef(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    const childProps = children.props ? { ...children.props } : {};
    const mergedProps = { ...childProps, ...props };
    // If the child is a DOM element, ref can be passed directly.
    // If it's a React component, it must accept a ref.
    return React.cloneElement(children, { ...mergedProps, ref });
  }
  return <div ref={ref} {...props}>{children}</div>; // Fallback if children isn't a single valid element
});
Slot.displayName = 'MockSlot';

// Add the dummy createSlot export
export const createSlot = (/* options */) => {
  const CreatedSlot = React.forwardRef(({ children, ...props }, ref) => {
    // Simplified further: just render children in a span, or directly if it's a single child
    if (React.isValidElement(children)) {
      // If you expect props to be passed through to the child, clone it.
      // Otherwise, for a very basic mock, just rendering children might be enough.
      // Cloning is safer to mimic behavior.
      return React.cloneElement(children, { ...props, ref});
    }
    return <span {...props} ref={ref}>{children}</span>;
  });
  CreatedSlot.displayName = 'MockCreatedSlot';
  return CreatedSlot;
};
