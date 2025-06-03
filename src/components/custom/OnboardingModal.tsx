import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, DatabaseZap, FileUp, Info } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Rocket className="mr-2 h-6 w-6 text-primary" />
            Welcome to PromptKeep!
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Your personal assistant for managing and organizing prompts.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center mb-2">
              <Info className="mr-2 h-5 w-5 text-blue-500" />
              What is PromptKeep?
            </h3>
            <p className="text-sm text-muted-foreground pl-7">
              PromptKeep helps you save, organize, and quickly access your favorite prompts for various AI tools and applications.
              No more scattered notes or lost ideas!
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg flex items-center mb-2">
              <DatabaseZap className="mr-2 h-5 w-5 text-green-500" />
              How Your Data is Stored
            </h3>
            <p className="text-sm text-muted-foreground pl-7">
              All your prompts and categories are stored directly in your browser's local storage.
            </p>
            <ul className="list-disc pl-12 mt-1 space-y-1 text-sm text-muted-foreground">
              <li><strong>Private & Secure:</strong> Your data never leaves your computer.</li>
              <li><strong>Offline Access:</strong> Access your prompts even without an internet connection.</li>
              <li><strong>Important:</strong> If you clear your browser's storage (e.g., history, cache), use a different browser, or switch devices, your prompts will not be accessible unless you've exported them.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg flex items-center mb-2">
              <FileUp className="mr-2 h-5 w-5 text-purple-500" />
              Import & Export Your Data
            </h3>
            <p className="text-sm text-muted-foreground pl-7">
              Easily back up your data or move it to another browser using the <strong>Export Data</strong> feature.
              You can then use <strong>Import Data</strong> to restore your collection.
            </p>
            <p className="text-sm text-muted-foreground pl-7 mt-1">
              Find these options in the user menu (click the user icon) at the top right corner of the page.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
