"use client";
import React, { useState, DragEvent, ChangeEvent } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  convoName: z
    .string()
    .min(2, { message: "Conversation name must be over 2 characters" }),
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

const ZipFileDropzone: React.FC = () => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [fuck, setFuck] = useState<File | null>(null);

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
      setFuck(selectedFile);
      console.log(fuck);
    }
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
    try {
      const formData = new FormData();
      formData.append("file", data.file); // Append the file
      formData.append("convoName", data.convoName);
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        setStatus(responseData.message || "Files extracted successfully.");
      } else {
        setStatus("Upload failed.");
      }
    } catch (error: any) {
      setStatus("Error: " + error.message);
    }
  };

  return (
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
                  } bg-white w-[250px] h-[80px] `}
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
                    className="cursor-pointer  text-blue-700 font-semibold"
                  >
                    Drag and drop a ZIP file here or click to select
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
              <FormItem>
                <FormControl>
                  <Input type="string" className="text-blue-700" {...field} />
                </FormControl>
                <FormMessage />
                <FormLabel
                  htmlFor="convoName"
                  className="cursor-pointer  text-blue-700 font-semibold"
                >
                  Drag and drop a ZIP file here or click to select
                </FormLabel>
              </FormItem>
            );
          }}
        />
        <button type="submit" className="hover:bg-red-500">
          submit
        </button>
        <p className="text-red-500 z-20">{status}</p>
        <p className="text-red-500">{fuck?.name || "fuck"}</p>
      </form>
    </Form>
  );
};

export default ZipFileDropzone;
