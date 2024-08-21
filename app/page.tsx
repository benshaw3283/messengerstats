"use client";

import ZipFileDropzone from "@/components/DragAndDrop";
import React from "react";
import Lists from "@/components/Lists";

import Request from "@/components/Request";
import { useQuery } from "@tanstack/react-query";
interface Reaction {
  reaction: string;
  actor: string;
}

interface Participant {
  name: string;
}

interface Message {
  sender_name: string;
  timestamp_ms: number;
  content: string;
  reactions: Array<Reaction>;
  is_geoblocked_for_viewer: boolean;
}

interface Content {
  image: any;
  is_still_participant: boolean;
  joinable_mode: any;
  magic_words: Array<any>;
  messages: Array<Message>;
  participants: Array<Participant>;
  thread_path: string;
  title: string;
}

interface SelectedFile {
  fileName: string;
  content: Content;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = React.useState<SelectedFile[]>([]);
  const [fileMessages, setFileMessages] = React.useState<Message[]>([]);

  const handleFilesUploaded = (files: any[]) => {
    setSelectedFiles(files);
    console.log("Files received from ZipFileDropzone:", files);
  };
  // let folderName = selectedFiles[0];

  const spreadMessages = async () => {
    if (selectedFiles.length > 0) {
      try {
        let totalMessages = [];
        for (const file of selectedFiles) {
          const fileContents: Array<Message> = file.content.messages;
          totalMessages.push(...fileContents);
        }
        setFileMessages((prev) => [...prev, ...totalMessages]);
      } catch (error) {
        console.error("Error spreading messages:", error);
      }
    }
  };

  React.useEffect(() => {
    if (selectedFiles.length > 0) {
      spreadMessages();

      console.log("selectedFiles", selectedFiles);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  return (
    <main className="bg-slate-950 text-white min-h-screen max-w-screen">
      <div className="flex flex-col ">
        <h1 className="flex  font-Switzer font-semibold  text-8xl py-4 pl-4 pb-24">
          Messenger Stats
        </h1>

        <div className=" flex flex-col gap-4 pl-10">
          <div className="h-[200px] w-[600px] flex  rounded-lg rounded-t-none rounded-br-none flex-col border-2 border-r-0 border-t-0  border-blue-700">
            <div className="bg-blue-700 rounded-tl-none w-full h-14 rounded-t-lg items-center flex pl-2">
              <h2 className="text-white font-Switzer font-semibold text-3xl tracking-wider">
                Request Files from Facebook
              </h2>
            </div>
            <div className="p-2 pt-4 pb-0 text-slate-500">
              <p>Facebook takes up to a day for your files to be ready.</p>
              <p>{`You will receive a notification when they're ready to be `}</p>
              <p>
                downloaded{" "}
                <a
                  href="https://accountscenter.facebook.com/info_and_permissions/dyi/"
                  className="font-semibold text-blue-700 underline cursor-pointer hover:text-white"
                >
                  here
                </a>
              </p>
              <p className="absolute pt-10">
                Or request manually by following the{" "}
                <a className="text-blue-700 underline cursor-pointer hover:text-white font-semibold ">
                  Tutorial
                </a>
              </p>
            </div>
            <div className="h-full justify-end flex place-items-end p-2">
              <Request />
            </div>
          </div>
          <div className="h-[300px] w-[600px] flex  rounded-lg rounded-t-none rounded-br-none flex-col border-2 border-r-0 border-t-0  border-blue-700">
            <div className="bg-blue-700 rounded-tl-none w-full h-14 rounded-t-lg items-center flex pl-2">
              <h2 className="text-white font-Switzer font-semibold text-3xl tracking-wider">
                Choose Files
              </h2>
            </div>
            <div className="p-2 pt-4 pb-0 text-slate-500">
              <p>
                Drop the zip file in the area below and enter the name of the
                conversation you want to see the stats of.
              </p>
            </div>
            <p className="absolute pt-[158px] pl-2 text-slate-500 text-sm">{`* If your system's storage is low the process may fail.`}</p>
            <div className="flex mt-20 rounded-tr-lg p-2 bg-blue-700 ">
              <ZipFileDropzone onFilesUploaded={handleFilesUploaded} />
            </div>
          </div>
        </div>
      </div>

      {selectedFiles.length ? (
        <Lists selectedFiles={selectedFiles} fileMessages={fileMessages} />
      ) : (
        <div>
          <p className="flex text-lg font-semibold justify-center pt-4">
            Upload files to see stats
          </p>
        </div>
      )}
    </main>
  );
}
