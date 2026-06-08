"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialDescription?: string;
  isEditing?: boolean;
}

export function CategoryForm({
  onSubmit,
  onCancel,
  initialTitle = "",
  initialDescription = "",
  isEditing = false,
}: CategoryFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim());
      setTitle("");
      setDescription("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="w-full md:w-96 bg-card border border-border rounded-t-lg md:rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Category" : "New Category"}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Category Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Appetizers"
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category"
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                {isEditing ? "Save Changes" : "Create Category"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
