import { Prompt, Category } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, Edit3, Trash2, MoreVertical } from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  category?: Category; // Optional: if category name needs to be displayed directly
  onCopy: (content: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: string) => void;
}

export const PromptCard = ({ prompt, category, onCopy, onEdit, onDelete }: PromptCardProps) => {
  const handleCopy = () => {
    onCopy(prompt.content);
  };

  const handleEdit = () => {
    onEdit(prompt);
  };

  const handleDelete = () => {
    onDelete(prompt.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{prompt.name}</CardTitle>
            {category && <CardDescription>{category.name}</CardDescription>}
            {!category && prompt.categoryId && <CardDescription>Category ID: {prompt.categoryId}</CardDescription>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 hover:text-red-500 focus:text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{prompt.content}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={handleCopy} className="w-full">
          <Copy className="mr-2 h-4 w-4" />
          Copy Prompt
        </Button>
      </CardFooter>
    </Card>
  );
};
