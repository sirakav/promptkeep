import React, { useState, useCallback } from 'react';
import { ImportDataDialog } from '@/components/custom/ImportDataDialog'; // Adjust path
import { Button } from '@/components/ui/button'; // For a button to open the dialog
import { Prompt } from '@/types'; // Ensure Prompt is imported

// Expose functions/variables to Playwright via window
declare global {
  interface Window {
    // Control functions
    openDialog?: (initialData?: Prompt | null) => void; // Use Prompt type
    closeDialog: () => void; // Should be called by the component's onClose
    // Callback trackers
    onCloseCalled?: boolean; // Matched to global.d.ts
    onImportCalledWith?: string | null; // Matched to global.d.ts
    // Utility to reset trackers
    resetTestState: () => void;
  }
}

const ImportDialogTestPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    window.resetTestState(); // Reset trackers when opening
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    console.log('Test Page: onClose triggered');
    window.onCloseCalled = true;
    setIsOpen(false);
  }, []);

  const handleImport = useCallback((jsonData: string) => {
    console.log('Test Page: onImport triggered with:', jsonData);
    window.onImportCalledWith = jsonData;
    // In a real app, you might call handleClose() here after successful import.
    // For testing, we keep it separate to verify both callbacks.
    // To test auto-close: handleClose();
  }, [/*handleClose*/]);

  // Expose control functions and reset state to Playwright
  if (typeof window !== 'undefined') {
    window.openDialog = handleOpen;
    window.closeDialog = handleClose; // Allow Playwright to also call close if needed, though usually testing component's close
    window.resetTestState = () => {
      window.onCloseCalled = false;
      window.onImportCalledWith = null;
      console.log('Test Page: State reset');
    };
    // Initialize state on first load
    if (window.onCloseCalled === undefined) { // Check if already initialized
        window.resetTestState();
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>ImportDataDialog Test Page</h1>
      <Button onClick={handleOpen} data-testid="open-dialog-button">
        Open Import Dialog
      </Button>
      <ImportDataDialog
        isOpen={isOpen}
        onClose={handleClose}
        onImport={handleImport}
      />
      {/* Display status for easier debugging in Playwright browser */}
      <div id="status-isOpen" style={{ marginTop: '10px' }}>Dialog isOpen: {isOpen.toString()}</div>
      <div id="status-onCloseCalled">onClose called: {typeof window !== 'undefined' && window.onCloseCalled?.toString()}</div>
      <div id="status-onImportCalledWith">onImport called with: {typeof window !== 'undefined' && window.onImportCalledWith}</div>
    </div>
  );
};

export default ImportDialogTestPage;
