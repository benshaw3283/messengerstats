"use client";
import React, { useState, DragEvent, ChangeEvent } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ProgressBar from "./Progress";
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
  onFilesUploaded: (files: any[]) => void; // Add this prop
}

const formSchema = z.object({
  convoName: z.string().min(2, { message: "Must be over 2 characters" }),
  file: z.any(),
  /*.refine(
      (file: File) =>
        file instanceof File && file.type === ("application/x-zip-compressed" || "application/zip"),
      {
        message: "Please upload a valid ZIP file.",
      }
    ),
    */
});

const ZipFileDropzone: React.FC<ZipFileDropzoneProps> = ({
  onFilesUploaded,
}) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [begun, setBegun] = useState<boolean>(false);
  const inputRef = React.useRef<any>(null);

  const fetchFilesFromServer = async () => {
    try {
      const response = await fetch("/api/getFiles");
      const files = await response.json();
      console.log(files);
      onFilesUploaded(files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

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

    handleFileUpload(files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      form.setValue("file", selectedFile); // Set the file in form state
    }
    console.log(inputRef);
  };

  const handleFileUpload = async (files: File[]) => {
    const zipFile = files.find((file) => file.name.endsWith(".zip"));

    if (!zipFile) {
      setStatus("Please upload a ZIP file.");
      return;
    }
    form.setValue("file", zipFile);
    console.log("file:", zipFile);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setBegun(true);
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("convoName", data.convoName);
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        setStatus(responseData.message);
        fetchFilesFromServer();
      } else {
        setStatus("Upload failed.");
        setBegun(false);
      }
    } catch (error: any) {
      setStatus("Error: " + error.message);
      console.log(status);
    }
  };

  return (
    <div>
      <p className="text-white text-xs">{inputRef?.current?.value}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => {
              return (
                <FormItem>
                  <div
                    className={`border-2 border-dashed border-blue-700 cursor-pointer rounded-lg  ${
                      dragging && "bg-blue-700 border-white"
                    } ${
                      inputRef?.current?.value?.length > 0
                        ? "bg-green-500"
                        : "bg-white"
                    } w-[250px] h-[80px] `}
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
                        ref={inputRef}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormLabel
                      htmlFor="zip-upload"
                      className="cursor-pointer justify-center mt-8 flex text-blue-700 font-semibold"
                    >
                      Drag and drop or select
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
            className="bg-slate-200 text-xl hover:bg-blue-700 hover:text-white text-blue-700 w-fit justify-self-center rounded-lg p-2 font-semibold font-Switzer tracking-wide h-fit ml-4 self-end px-3"
          >
            submit
          </button>
          <p className="text-red-500 z-20  ">{status}</p>
        </form>
      </Form>
      {begun && <ProgressBar />}
    </div>
  );
};

export default ZipFileDropzone;
