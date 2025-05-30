type Prompt = import('@/types').Prompt;

interface Window {
  resetTestState: () => void;
  onImport?: (jsonData: string) => void;
  closeDialog: () => void;
  onCloseCalled?: boolean;
  onImportCalledWith?: string | null;
  openDialog?: (initialData?: Prompt | null) => void;
  onSubmitCalledWith?: { promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>, categoryName: string } | null;
  onCopyCalledWith?: string | null;
  onEditCalledWith?: Prompt | null;
  onDeleteCalledWith?: string | null;
  setPromptCardProps?: (props: { prompt: Prompt, category?: import('@/types').Category }) => void;
} 