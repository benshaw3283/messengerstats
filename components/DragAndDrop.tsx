"use client";
import React, { useState, DragEvent, ChangeEvent, useCallback } from "react";
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
  file: z.array(z.instanceof(File)), // Correctly define the file field as an array of File objects
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
      file: [],
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

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const items = e.dataTransfer.items;
    const files: File[] = [];

    const traverseDirectory = (item: any, path: string): Promise<void> => {
      return new Promise<void>((resolve) => {
        if (item.isDirectory) {
          const dirReader = item.createReader();
          dirReader.readEntries(async (entries: any[]) => {
            for (const entry of entries) {
              await traverseDirectory(entry, path + item.name + "/");
              //console.log(path);
            }
            resolve();
          });
        } else if (item.isFile) {
          item.file((file: File) => {
            // The webkitRelativePath is already populated, so no need to set it manually
            files.push(file);
            resolve();
          });
        }
      });
    };

    const readItems = async () => {
      const promises = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
          promises.push(traverseDirectory(item, ""));
        }
      }
      await Promise.all(promises);
      form.setValue("file", files); // Set the file array in the form
      form.trigger("file"); // Trigger validation or any side effects on change
    };

    await readItems();
  };

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const allFiles = Array.from(files);
        //console.log("Files uploaded:", allFiles);

        form.setValue("file", allFiles); // Pass the entire file array
        form.trigger("file");
      }
    },
    [form]
  );

  const splitIntoChunks = (files: File[], maxSize: number) => {
    console.log(maxSize);
    let chunk: File[] = [];
    let chunkSize = 0;
    const chunks: File[][] = [];

    files.forEach((file) => {
      const fileSize = file.size;

      // Split based on size
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
    //console.log("chunks", chunks);
    return chunks;
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const fileList = data.file;
      if (fileList && fileList.length > 0) {
        const allFiles = Array.from(fileList);
        // console.log("Files before chunking:", allFiles);

        // Split the uploaded folder into chunks (if necessary)
        const chunks = splitIntoChunks(allFiles, 2 * 1024 * 1024 * 1024); // 2GB chunks
        // console.log(`Total Chunks Created: ${chunks.length}`);

        // Traverse each chunk to find the convoName folder
        const convoFiles: File[] = [];
        chunks.forEach((chunk) => {
          chunk.forEach((file) => {
            const path = file.webkitRelativePath;
            if (
              path.includes("your_facebook_activity/messages/inbox/") &&
              path.includes(data.convoName)
            ) {
              convoFiles.push(file);
            }
          });
        });

        if (convoFiles.length === 0) {
          throw new Error(
            `No folder found matching convoName "${data.convoName}"`
          );
        }

        // Send files for further processing
        onFilesUploaded(convoFiles);
      } else {
        throw new Error("No files found in the selected folder");
      }
    } catch (error: any) {
      console.error("Error processing folder:", error);
    }
  };

  const fileName = form.getValues("file");

  return (
    <div>
      <p>{fileName ? `Selected: ` : "No file selected"}</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row items-end"
        >
          <FormField
            control={form.control}
            name="file"
            render={({ field, fieldState, formState }) => {
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
                        multiple
                        className="opacity-0 w-[250px] h-[80px] absolute cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormLabel
                      htmlFor="folder-upload"
                      className="cursor-pointer h-full place-items-center justify-center flex text-white font-bold"
                    >
                      {fileName.length > 0 ? (
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
            className="bg-slate-200 text-xl disabled:cursor-not-allowed hover:shadow-inner hover:shadow-white hover:bg-blue-700 hover:text-white text-blue-700  justify-self-center rounded-lg p-2 font-semibold font-Switzer tracking-wide h-fit ml-2 self-end px-3"
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
