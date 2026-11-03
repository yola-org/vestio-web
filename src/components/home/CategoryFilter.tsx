'use client';

import { useState } from 'react';
import { ChevronIcon } from '@/components/shared/Icons';
import { Category } from '@/types/api';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[], selected: boolean) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryIds,
  onToggle,
  onSelectAll,
}: CategoryFilterProps) {
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleParent = (parentId: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const isParentSelected = (parent: Category) => {
    if (!parent.nestedCategories || parent.nestedCategories.length === 0) {
      return selectedCategoryIds.includes(parent.id);
    }
    return parent.nestedCategories.every((child) => selectedCategoryIds.includes(child.id));
  };

  const handleParentToggle = (parent: Category) => {
    const childrenIds = parent.nestedCategories?.map((c) => c.id) || [];
    const idsToToggle = [parent.id, ...childrenIds];
    const currentlySelected = isParentSelected(parent);
    onSelectAll(idsToToggle, !currentlySelected);
  };

  return (
    <div className="space-y-4">
      {categories.map((parent) => {
        const isExpanded = expandedParents[parent.id];
        const hasChildren = parent.nestedCategories && parent.nestedCategories.length > 0;
        const selected = isParentSelected(parent);

        return (
          <div key={parent.id} className="space-y-2">
            <div className="flex items-center justify-between group">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleParentToggle(parent)}
                  className="h-4 w-4 rounded border-black/15 text-[#173fdb] focus:ring-[#173fdb]"
                />
                <span className="text-sm font-bold text-black/80 group-hover:text-[#173fdb]">
                  {parent.name}
                </span>
              </label>
              {hasChildren && (
                <button
                  onClick={() => toggleParent(parent.id)}
                  className="p-1 hover:bg-black/5 rounded-md transition-colors"
                >
                  <ChevronIcon
                    className={`h-4 w-4 text-black/40 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className="ml-7 space-y-2 pt-1 border-l border-black/5 pl-4">
                {parent.nestedCategories?.map((child) => (
                  <label key={child.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(child.id)}
                      onChange={() => onToggle(child.id)}
                      className="h-4 w-4 rounded border-black/15 text-[#173fdb] focus:ring-[#173fdb]"
                    />
                    <span className="text-sm font-medium text-black/60 group-hover:text-[#173fdb]">
                      {child.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
