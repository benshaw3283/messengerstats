"use client";
import React, { useState, DragEvent, ChangeEvent, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "./ui/use-toast";
import { useDropzone } from "react-dropzone";
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
  file: z.array(z.instanceof(File)),
});

const FolderDropzone: React.FC<FolderDropzoneProps> = ({ onFilesUploaded }) => {
  const { toast } = useToast();
  const [begun, setBegun] = useState<boolean>(false);
  const folderName = React.useRef<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      convoName: "",
      file: [],
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      //@ts-ignore
      const path = acceptedFiles[0].path.split("/")[1];

      if (acceptedFiles.length > 0) {
        folderName.current = path;
        form.setValue("file", acceptedFiles);
        form.trigger("file");
      }
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const allFiles = Array.from(files);
        //console.log("Files uploaded:", allFiles);
        folderName.current = allFiles[0]?.webkitRelativePath.split("/")[0];
        form.setValue("file", allFiles);
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
    setBegun(true);

    if (folderName.current !== "your_facebook_activity") {
      toast({
        title: "Wrong folder uploaded!",
        description:
          "Open the ZIP file and upload the ( your_facebook_activity ) folder",
        variant: "destructive",
      });
      setBegun(false);
      return;
    }

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
            //@ts-ignore
            const path = file.webkitRelativePath || file?.path;
            if (
              path.includes("your_facebook_activity/messages/inbox/") &&
              path.includes(data.convoName.toLowerCase().replace(/\s+/g, ""))
            ) {
              convoFiles.push(file);
            }
          });
        });

        if (convoFiles.length === 0) {
          toast({
            title:
              "Could not find conversation folder. Check the spelling and try again!",
            variant: "destructive",
          });
          setBegun(false);
          throw new Error(
            `No folder found matching convoName "${data.convoName}"`
          );
        }

        onFilesUploaded(convoFiles);
        toast({
          title: "Files uploaded!",
          className: "bg-green-600 text-white text-2xl",
        });
        setBegun(false);
      } else {
        throw new Error("No files found in the selected folder");
      }
    } catch (error: any) {
      console.error("Error processing folder:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-row">
        <p className="pr-1">Selected:</p>
        <p className="font-semibold">
          {folderName.current?.length > 0
            ? folderName.current
            : "No file selected"}
        </p>
        {folderName.current?.length > 0 &&
          folderName.current === "your_facebook_activity" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 pl-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
                className="text-green-400"
              />
            </svg>
          )}
        {folderName.current?.length > 0 &&
          folderName.current !== "your_facebook_activity" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-red-600 pl-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          )}
      </div>
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
                      isDragActive ? "border-2 border-double" : ""
                    } bg-blue-700 lg:w-[250px] md:w-[250px] w-[150px] h-[102px]`}
                    {...getRootProps()}
                  >
                    <FormControl>
                      <Input
                        type="file"
                        // @ts-ignore
                        webkitdirectory="true"
                        multiple
                        className="opacity-0 lg:w-[250px] w-[150px] h-[80px] absolute cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormLabel
                      htmlFor="folder-upload"
                      className="cursor-pointer h-full place-items-center justify-center flex text-white font-bold"
                    >
                      {folderName.current?.length > 0 ? (
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
                        <p className="pl-4">Drag and drop or select</p>
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
                    className="lg:text-lg md:text-lg text-base text-white font-semibold"
                  >
                    Conversation Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="string"
                      className="text-blue-700 lg:w-56 md:w-56 w-32"
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
    </div>
  );
};

export default FolderDropzone;
