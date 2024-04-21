"use client";
import React from "react";

interface Reaction {
  reaction: string;
  actor: string;
}

interface Message {
  sender_name: string;
  timestamp_ms: number;
  content: string;
  reactions: Array<Reaction>;
  is_geoblocked_for_viewer: boolean;
}

interface File {
  name: string;
  type: string;
  size: number;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  selectedFiles.forEach((file, index) => {
    const currentFile = selectedFiles[index];

    // Create a new FileReader object
    const reader = new FileReader();

    // Define an event handler for when the file reading is complete
    reader.onload = (event: any) => {
      // Access the file contents from the event target
      const fileContents = event.target.result;

      // Parse the file contents as JSON
      try {
        const jsonData = JSON.parse(fileContents);

        console.log(jsonData.messages.length); // This will log the parsed JSON data to the console
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    // Read the file as text
    reader.readAsText(currentFile);
  });

  const handleFileSelect = (event: any) => {
    const files = event.target.files; // Access the FileList object

    // Convert the FileList object to an array
    const fileListArray: File[] = Array.from(files);

    // Update state to store the array of selected files
    setSelectedFiles(fileListArray);
  };

  return (
    <main>
      <div className="flex flex-col container">
        <h1 className="flex self-center font-bold text-3xl pt-4">
          Facebook Messenger Statistics
        </h1>

        <div>
          {/* @ts-expect-error */}
          <input
            type="file"
            directory=""
            webkitdirectory=""
            multiple
            onChange={handleFileSelect}
          />
        </div>
        <div>
          <h2>Selected Files:</h2>
          <ul>
            {selectedFiles?.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
