"use client";

import ZipFileDropzone from "@/components/DragAndDrop";
import React from "react";
import Lists from "@/components/Lists";
import Demo from "@/components/Demo";
import Request from "@/components/Request";
import { read } from "fs";

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

interface Info {
  participants?: Array<Participant>;
  title?: string;
}

interface SelectedFile {
  name: string;
  content: Content;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = React.useState<SelectedFile[]>([]);
  const [fileMessages, setFileMessages] = React.useState<Message[]>([]);
  const [populated, setPopulated] = React.useState(false);
  const [info, setInfo] = React.useState<Info>({});

  const handleFilesUploaded = (files: any[]) => {
    setSelectedFiles(files);

    console.log("Files received from ZipFileDropzone:", files);
  };
  // let folderName = selectedFiles[0];

  const spreadMessages = async () => {
    if (selectedFiles.length > 0) {
      try {
        const messagePromises = selectedFiles.map(async (file) => {
          const fileName = file?.name.toLowerCase();

          // Check if it's a JSON file
          if (fileName.endsWith(".json")) {
            const reader = new FileReader();

            // Return a promise to read the file
            const fileContent = await new Promise<Content>(
              (resolve, reject) => {
                reader.onload = (event) => {
                  try {
                    const parsedContent: Content = JSON.parse(
                      event.target?.result as string
                    );
                    resolve(parsedContent);
                  } catch (error) {
                    reject(error);
                  }
                };
                reader.onerror = reject;
                reader.readAsText(file as any);
              }
            );

            console.log("fileContent:", fileContent);

            setInfo({
              participants: fileContent.participants,
              title: fileContent.title,
            });
            return fileContent.messages || [];
          }

          return []; // If not a JSON file, return an empty array
        });

        // Wait for all file read promises to resolve concurrently
        const allMessages = await Promise.all(messagePromises);

        // Flatten the array of arrays and update the state
        const totalMessages = allMessages.flat();
        setFileMessages(totalMessages);

        if (totalMessages.length > 0) {
          setPopulated(true);
        } else {
          console.log("fileMessages not populated correctly");
        }

        console.log(
          "Processed JSON files and updated messages:",
          totalMessages
        );
      } catch (error) {
        console.error("Error spreading messages:", error);
      }
    }
  };

  React.useEffect(() => {
    if (selectedFiles.length > 0) {
      spreadMessages();

      console.log("selectedFiles", selectedFiles);
      console.log("info", info);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  return (
    <main className="bg-slate-950 text-white min-h-screen max-w-screen">
      <div className="flex flex-col ">
        <h1 className="flex  font-Switzer font-semibold  text-8xl py-4 pl-4 pb-24">
          Messenger Stats
        </h1>

        <div className="flex flex-row w-full gap-[500px] md:gap-[300px]">
          <div className=" flex flex-col gap-4 pl-10">
            <div className="h-[200px] w-[600px] flex  rounded-lg rounded-t-none rounded-br-none flex-col border-2 border-r-0 border-t-0  border-blue-700">
              <div className="bg-blue-700 rounded-tl-none w-full h-14 rounded-t-lg items-center flex pl-2">
                <h2 className="text-white font-Switzer font-semibold text-3xl tracking-wider">
                  Request Files from Facebook
                </h2>
              </div>
              <div className="p-2 pt-2 text-slate-500">
                <p>
                  Facebook takes up to{" "}
                  <strong className="text-white">1 day</strong> for your files
                  to be ready.
                </p>
                <p>{`You will receive a notification when they're ready to be `}</p>
                <p>
                  downloaded{" "}
                  <a
                    href="https://accountscenter.facebook.com/info_and_permissions/dyi/"
                    className="font-semibold text-blue-700 underline cursor-pointer hover:text-white"
                  >
                    here
                  </a>
                  <span className="text-sm pl-2">{`(Download the 3rd available file)`}</span>
                </p>
                <p className="absolute pt-14 text-sm">
                  Or request manually by following the{" "}
                  <a
                    href="/tutorial"
                    className="text-blue-700 underline cursor-pointer hover:text-white font-semibold "
                  >
                    Tutorial
                  </a>
                </p>
              </div>
              <div className="h-full justify-end flex place-items-end p-2">
                <Request />
              </div>
            </div>
            <div className="h-[288px] w-[600px] flex  rounded-lg rounded-t-none rounded-br-none flex-col border-2 border-r-0 border-t-0  border-blue-700">
              <div className="bg-blue-700 rounded-tl-none w-full h-14 rounded-t-lg items-center flex pl-2">
                <h2 className="text-white font-Switzer font-semibold text-3xl tracking-wider">
                  Choose Files
                </h2>
              </div>
              <div className="p-2 pt-1 pb-0 text-slate-500">
                <p>
                  Drop the zip file in the area below and enter the name of the
                  conversation you want to see the stats of.
                </p>
              </div>

              <div className="flex mt-20 rounded-tr-lg p-2 bg-blue-700 ">
                <ZipFileDropzone onFilesUploaded={handleFilesUploaded} />
              </div>
            </div>
          </div>
          <div className="-translate-y-[100px] scale-75 border-l-2 border-b-2 border-blue-700 rounded-lg rounded-br-none ">
            <div className="bg-blue-700 rounded-t-lg h-14 justify-center place-items-center flex">
              <h1 className=" font-Switzer text-4xl font-semibold tracking-wide ">
                Demo
              </h1>
            </div>
            <div className="p-10">
              <Demo />
            </div>
          </div>
        </div>
      </div>

      {populated ? (
        <div>
          <Lists
            selectedFiles={selectedFiles}
            fileMessages={fileMessages}
            info={info}
          />
        </div>
      ) : (
        <div>
          <p className="flex text-lg font-semibold justify-center pt-4">
            Upload ZIP file to see stats
          </p>
        </div>
      )}
    </main>
  );
}
