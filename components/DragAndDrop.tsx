import React, { useState, DragEvent, ChangeEvent } from "react";

interface FolderDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

const FolderDropzone: React.FC<FolderDropzoneProps> = ({ onFilesSelected }) => {
  const [dragging, setDragging] = useState<boolean>(false);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelection(files);
  };

  const handleFileSelection = (files: File[]) => {
    // Filter to include only JSON files
    const jsonFiles = files.filter(
      (file) => file.type === "application/json" || file.name.endsWith(".json")
    );
    onFilesSelected(jsonFiles);
  };

  return (
    <div
      style={{
        border: "2px dashed #ccc",
        padding: "20px",
        borderRadius: "8px",
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: dragging ? "#f0f0f0" : "#ffffff",
      }}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        // @ts-ignore
        webkitdirectory="true"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="folder-upload"
      />
      <label htmlFor="folder-upload" style={{ cursor: "pointer" }}>
        Drag and drop a folder here or click to select
      </label>
    </div>
  );
};

export default FolderDropzone;
