import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle } from 'lucide-react';
import { exportData, importData } from '../../lib/localStorage'; // importData added
import { toast } from 'sonner';
import { ImportDataDialog } from './ImportDataDialog';

export const Navbar = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleExport = () => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'promptkeep_backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data Exported", { description: "Your data has been downloaded." });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export Failed", { description: "Could not export your data." });
    }
  };

  };

  const handleImportData = (jsonData: string) => {
    const result = importData(jsonData);
    if (result.success) {
      toast.success("Import Successful", { description: result.message });
      window.location.reload(); // Reload to reflect changes
    } else {
      toast.error("Import Failed", { description: result.message });
    }
    setIsImportDialogOpen(false);
  };

  return (
    <header className="bg-background border-b">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">
          PromptKeep
        </div>
        {/* Navigation links or other elements can be added here later */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}> {/* Updated onClick */}
                Import Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <ImportDataDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportData} // Updated onImport prop
      />
    </header>
  );
};
