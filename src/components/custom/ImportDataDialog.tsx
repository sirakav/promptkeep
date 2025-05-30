'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ImportDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonData: string) => void;
}

export const ImportDataDialog = ({ isOpen, onClose, onImport }: ImportDataDialogProps) => {
  const [jsonText, setJsonText] = useState<string>("");
  // const [selectedFile, setSelectedFile] = useState<File | null>(null); // Removed unused state

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // setSelectedFile(file); // Removed
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonText(content);
      };
      reader.readAsText(file);
    } else {
      // setSelectedFile(null); // Removed
      // If a file was previously selected and then cleared, also clear jsonText
      // only if it was populated from a file.
      // For simplicity, we can clear it or decide if jsonText should persist
      // if the user manually edited it after uploading.
      // Current behavior: if file input is cleared, jsonText (potentially from that file) remains.
      // User can manually clear textarea if needed or upload another file.
    }
  };

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(event.target.value);
  };

  const handleImportClick = () => {
    if (jsonText.trim()) {
      onImport(jsonText);
    }
  };

  // Reset state when dialog is closed then reopened
  // This is a common pattern if we want the dialog to be fresh each time.
  // However, the isOpen prop change itself doesn't re-mount the component unless its key changes.
  // For now, let's rely on onClose to potentially reset state if needed by parent.
  // Or, we can add a useEffect hook listening to `isOpen`. If `isOpen` becomes true, reset states.
  // For simplicity, the state persists while the component is mounted.
  // If a full reset is needed each time it opens, parent should manage that or pass a key.

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-2xl">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Upload a JSON file or paste your JSON data below. This will overwrite existing data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="json-file-upload" className="text-right">
              Upload File
            </Label>
            <Input
              id="json-file-upload"
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="json-text-input">Or Paste JSON Data</Label>
            <Textarea
              id="json-text-input"
              value={jsonText}
              onChange={handleTextChange}
              placeholder="Paste your JSON data here..."
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleImportClick} disabled={!jsonText.trim()}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
