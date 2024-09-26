"use client";
import React, { useState, DragEvent, ChangeEvent } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "./ui/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FolderDropzoneProps {
  onFilesUploaded: (files: any[]) => void;
}

const formSchema = z.object({
  convoName: z.string().min(2, { message: "Must be over 2 characters" }),
  file: z.any(),
});

const FolderDropzone: React.FC<FolderDropzoneProps> = ({ onFilesUploaded }) => {
  const { toast } = useToast();
  const [dragging, setDragging] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [begun, setBegun] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      convoName: "",
    },
  });

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
    form.setValue("file", files); // Set the entire file list, not just the first file
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target?.files;
    if (selectedFiles) {
      form.setValue("file", selectedFiles);
      form.trigger("file");
    }
  };

  // Step 1: Split entire folder into chunks (for browser limit purposes)
  const splitIntoChunks = (files: File[], maxSize: number) => {
    console.log(maxSize);
    let chunk: File[] = [];
    let chunkSize = 0;
    const chunks: File[][] = [];

    files.forEach((file) => {
      const fileSize = file.size;
      if (chunkSize + fileSize <= maxSize) {
        chunk.push(file);
        chunkSize += fileSize;
      } else {
        chunks.push(chunk);
        chunk = [file];
        chunkSize = fileSize;
      }
    });

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    return chunks;
  };

  const traverseFolder = async (
    directoryEntry: any,
    convoName: string
  ): Promise<File[]> => {
    return new Promise((resolve) => {
      const reader = directoryEntry.createReader();
      let entries: any[] = [];
      let targetFiles: File[] = [];

      const readEntries = () => {
        reader.readEntries(async (fileEntries: any[]) => {
          if (fileEntries.length === 0) {
            // No more entries to read, process them
            for (const entry of entries) {
              if (entry.isFile) {
                entry.file((file: File) => {
                  if (file.size > 0) {
                    targetFiles.push(file);
                  }
                });
              }
            }
            resolve(targetFiles);
          } else {
            entries.push(...fileEntries);
            readEntries(); // Continue reading entries
          }
        });
      };
      readEntries();
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setBegun(true);
    try {
      const fileList = data.file;
      console.log(fileList);

      if (fileList && fileList.length > 0) {
        // Log the entire folder content for debugging
        const allFiles = Array.from(fileList as FileList);
        console.log("Files before chunking:", allFiles);

        // Chunk the entire folder (since it's larger than 7GB)
        const folderChunks = splitIntoChunks(allFiles, 2 * 1024 * 1024 * 1024); // 2GB chunks

        console.log("Folder has been split into chunks:", folderChunks.length);

        // Now, traverse each chunk to find the convoName folder
        const matchingFiles: File[] = [];

        for (const chunk of folderChunks) {
          for (const file of chunk) {
            const path = file.webkitRelativePath;

            // Find the convoName folder inside 'messages/inbox'
            if (
              path.includes("messages/inbox/") &&
              path.includes(data.convoName)
            ) {
              matchingFiles.push(file);
              console.log(`${file.name}: ${file.size} bytes at path: ${path}`);
            }
          }
        }

        // If no matching conversation folder found, throw an error
        if (matchingFiles.length === 0) {
          throw new Error(
            `No folder found matching convoName "${data.convoName}"`
          );
        }

        // Send the matched files from the convoName folder to the parent component
        onFilesUploaded(matchingFiles);
        setBegun(false);
      } else {
        throw new Error("No files found in the selected folder");
      }
    } catch (error: any) {
      console.error("Error processing folder:", error);
      setStatus("Error: " + error.message);
      setBegun(false);
    }
  };

  const fileName = form.getValues("file");

  return (
    <div>
      <p>{fileName ? `Selected: ${fileName[0]?.name}` : "No file selected"}</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row items-end"
        >
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => {
              return (
                <FormItem>
                  <div
                    className={`border-2 border-dashed border-white cursor-pointer rounded-lg ${
                      dragging ? "border-2 border-double" : ""
                    } bg-blue-700 w-[250px] h-[102px]`}
                    onDragEnter={handleDragEnter}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <FormControl>
                      <Input
                        type="file"
                        // @ts-ignore
                        webkitdirectory="true"
                        className="opacity-0 w-[250px] h-[80px] absolute cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormLabel
                      htmlFor="folder-upload"
                      className="cursor-pointer h-full place-items-center justify-center flex text-white font-bold"
                    >
                      {fileName ? (
                        <div className="flex-col flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="white"
                            className="size-10"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <p className="text-white">Files Selected</p>
                        </div>
                      ) : (
                        "Drag and drop or select"
                      )}
                    </FormLabel>
                  </div>
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="convoName"
            render={({ field }) => {
              return (
                <FormItem className="pl-2 pt-1">
                  <FormLabel
                    htmlFor="convoName"
                    className="text-lg text-white font-semibold"
                  >
                    Conversation Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="string"
                      className="text-blue-700 w-56"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              );
            }}
          />
          <button
            type="submit"
            className="bg-slate-200 text-xl disabled:cursor-not-allowed hover:border-white hover:border-2 hover:bg-blue-700 hover:text-white text-blue-700 w-fit justify-self-center rounded-lg p-2 font-semibold font-Switzer tracking-wide h-fit ml-2 self-end px-3"
            disabled={begun}
          >
            submit
          </button>
        </form>
      </Form>
      {begun ? <p>Processing...</p> : null}
      {status && <p>{status}</p>}
    </div>
  );
};

export default FolderDropzone;
