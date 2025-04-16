
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageSearchPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchImages: () => void;
  isLoading: boolean;
}

const ImageSearchPanel: React.FC<ImageSearchPanelProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearchImages,
  isLoading
}) => {
  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Buscar imagens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearchImages} disabled={isLoading}>
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default ImageSearchPanel;
