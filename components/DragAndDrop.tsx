"use client";
import React, { useState, DragEvent, ChangeEvent } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ProgressBar from "./Progress";
import { useToast } from "./ui/use-toast";
import JSZip from "jszip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ZipFileDropzoneProps {
  onFilesUploaded: (files: any[]) => void;
}

const formSchema = z.object({
  convoName: z.string().min(2, { message: "Must be over 2 characters" }),
  file: z
    .any()
    .refine(
      (file: File) =>
        file.type === "application/x-zip-compressed" ||
        file.type === "application/zip",
      {
        message: "Please upload a valid ZIP file.",
      }
    ),
});

const ZipFileDropzone: React.FC<ZipFileDropzoneProps> = ({
  onFilesUploaded,
}) => {
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
    form.setValue("file", files[0]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0];
    if (selectedFile) {
      form.setValue("file", selectedFile);
      form.trigger("file");
    }
  };

  const extractJsonFilesFromZip = async (
    zip: JSZip,
    convoFormatted: string
  ): Promise<any[]> => {
    const jsonFiles: any[] = [];

    // Pattern to match the folder path
    const folderPattern = new RegExp(
      `^your_facebook_activity/messages/inbox/${convoFormatted}_\\d+/`
    );

    try {
      // Iterate over all files in the ZIP archive
      for (const filename of Object.keys(zip.files)) {
        const file = zip.files[filename];
        console.log(file);

        // Check if the file is within the target folder
        if (folderPattern.test(file.name) && file.name.endsWith(".json")) {
          // Extract and parse JSON files
          const content = await file.async("text");
          jsonFiles.push(JSON.parse(content));
          console.log(jsonFiles);
        }
      }
    } catch (error) {
      console.error("Error extracting JSON files:", error);
      throw new Error("Error processing JSON files from the ZIP archive.");
    }

    return jsonFiles;
  };

  const MAX_CHUNK_SIZE = 1 * 1024 * 1024 * 1024; // 1GB in bytes

  const splitFileIntoChunks = (file: File) => {
    const chunks = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + MAX_CHUNK_SIZE, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }

    return chunks;
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setBegun(true);
    try {
      if (!(data.file instanceof File)) {
        throw new Error("Invalid file object.");
      }

      // Split the file into chunks
      const chunks = splitFileIntoChunks(data.file);
      console.log(`File split into ${chunks.length} chunks.`);

      chunks.forEach(async (chunk, index) => {
        console.log(`Processing chunk ${index + 1} of ${chunks.length}`);
        const zip = new JSZip();
        const fileContent: any = await readFileAsArrayBuffer(chunk);
        await zip?.loadAsync(fileContent);
        console.log(`Chunk ${index + 1} loaded successfully.`);

        const convoFormatted = data.convoName.replace(/\s+/g, "").toLowerCase();
        const jsonFiles = await extractJsonFilesFromZip(zip, convoFormatted);
        console.log("JSON files extracted from chunk:", jsonFiles);
        onFilesUploaded(jsonFiles);
      });
      toast({
        title: "Files processed successfully",
        variant: "default",
        className: "border-2 border-white bg-green-600 text-white",
      });
    } catch (error) {
      console.error("Error processing the ZIP file:", error);
      toast({
        title: "Error processing file",
        description: "Error extracting files",
        variant: "destructive",
      });
    } finally {
      setBegun(false);
    }
  };

  const readFileAsArrayBuffer = (blob: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer."));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  };

  const fileName = form.getValues("file");

  return (
    <div>
      <p>{fileName?.name}</p>
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
                    className={`border-2 border-dashed  border-white cursor-pointer rounded-lg  ${
                      dragging && "border-2 border-double"
                    } bg-blue-700 w-[250px] h-[102px] `}
                    onDragEnter={handleDragEnter}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <FormControl>
                      <Input
                        type="file"
                        accept=".zip"
                        className="opacity-0 w-[250px] h-[80px] absolute cursor-pointer"
                        onChange={(e) => handleFileChange(e)}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormLabel
                      htmlFor="zip-upload"
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
                    className="text-lg   text-white font-semibold"
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
      {begun ? <p>processing</p> : null}
    </div>
  );
};

export default ZipFileDropzone;
