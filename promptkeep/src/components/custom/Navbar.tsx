import React from 'react';

export const Navbar = () => {
  return (
    <header className="bg-background border-b">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">
          PromptKeep
        </div>
        {/* Navigation links or other elements can be added here later */}
        <div>
          {/* Placeholder for future buttons like "Add New Prompt" or settings */}
        </div>
      </nav>
    </header>
  );
};
