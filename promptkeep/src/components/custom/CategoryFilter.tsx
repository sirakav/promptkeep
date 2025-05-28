import React from 'react';
import { Category } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  allCategoriesLabel?: string;
}

export const CategoryFilter = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  allCategoriesLabel = "All Categories",
}: CategoryFilterProps) => {
  const handleValueChange = (value: string) => {
    // The Select component returns the string value of the item.
    // If it's the "all categories" value, we pass null.
    onCategoryChange(value === "all" ? null : value);
  };

  return (
    <Select
      value={selectedCategoryId || "all"}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-full md:w-[200px]"> {/* Responsive width */}
        <SelectValue placeholder={allCategoriesLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allCategoriesLabel}</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
