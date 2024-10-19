"use client";
import ZipFileDropzone from "@/components/DragAndDrop";
import React, { Suspense, memo } from "react";
import Lists from "@/components/Lists";
import Request from "@/components/Request";
import { motion } from "framer-motion";
import PhoneDemo from "@/components/PhoneDemo";
const Demo = memo(React.lazy(() => import("@/components/Demo")));
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";

interface StoreState {
  selectedFiles: SelectedFile[];
  fileMessages: Message[];
  info: Info;
  show: boolean;
  demo: number;
  setSelectedFiles: (files: SelectedFile[]) => void;
  setFileMessages: (messages: Message[]) => void;
  setInfo: (info: Info) => void;
  setShow: (show: boolean) => void;
  setDemo: (demo: number) => void;
}

const useStore = create<StoreState>((set) => ({
  selectedFiles: [],
  fileMessages: [],
  info: {},
  show: false,
  demo: 0,
  setSelectedFiles: (files) => set(() => ({ selectedFiles: files })),
  setFileMessages: (messages) => set(() => ({ fileMessages: messages })),
  setInfo: (info) => set(() => ({ info })),
  setShow: (show) =>
    set((state) => {
      if (state.show !== show) {
        return { show };
      }
      return state;
    }),
  setDemo: (demo) =>
    set((state) => {
      if (state.demo !== demo) {
        return { demo };
      }
      return state;
    }),
}));

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
  const {
    selectedFiles,
    fileMessages,
    info,
    show,
    demo,
    setSelectedFiles,
    setFileMessages,
    setInfo,
    setDemo,
    setShow,
  } = useStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["selectedFiles", selectedFiles],
    queryFn: async () => {
      return await spreadMessages();
    },
    enabled: selectedFiles.length > 0,
  });

  const handleFilesUploaded = React.useCallback(
    (files: any[]) => {
      setSelectedFiles(files);
      console.log("Files received from ZipFileDropzone:", files);
    },
    [setSelectedFiles]
  );

  const spreadMessages = async () => {
    const updatedInfo: Info = {};
    const allMessages: Message[] = [];

    const messagePromises = selectedFiles.map(async (file) => {
      const fileName = file?.name.toLowerCase();

      if (fileName.endsWith(".json")) {
        const reader = new FileReader();

        const fileContent = await new Promise<Content>((resolve, reject) => {
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
        });

        // Accumulate the information to avoid updating state multiple times
        if (!updatedInfo.participants) {
          updatedInfo.participants = fileContent.participants;
        }
        if (!updatedInfo.title) {
          updatedInfo.title = fileContent.title;
        }

        allMessages.push(...(fileContent.messages || []));
      }
    });

    await Promise.all(messagePromises);

    console.log("Processed JSON files and updated messages:", allMessages);
    return [allMessages, updatedInfo];
  };

  const motionProps = React.useMemo(() => {
    return {
      initial: { scaleY: 1, height: "auto" },
      animate: { scaleY: show ? 0 : 1, height: show ? 0 : "auto" },
      transition: { duration: 0.5, ease: "easeInOut" },
      style: {
        transformOrigin: "top",
        overflow: "hidden",
      },
    };
  }, [show]);

  const listsProps = React.useMemo(
    () => ({
      selectedFiles,
      fileMessages,
      info,
    }),
    [selectedFiles, fileMessages, info]
  );

  const MemoizedLists = React.memo(Lists);

  React.useEffect(() => {
    if (data) {
      const [messages, info] = data as [Message[], Info];
      setFileMessages(messages || []);
      setInfo(info || {});
      setShow(messages.length > 0);
    }
  }, [data, setFileMessages, setInfo, setShow]);

  return (
    <main className="bg-slate-950 text-white min-h-screen max-w-screen">
      <div className="visible lg:invisible absolute top-0 -right-0 p-1 text-slate-500   font-semibold">
        <PhoneDemo />
      </div>
      <div
        onClick={() => setShow(!show)}
        className={`${
          data ? "visible" : "invisible"
        }  top-0 left-0 flex flex-row w-fit h-fit p-1 bg-gray-800 rounded-br-lg sticky cursor-pointer`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`size-5 transition-transform duration-200 ${
            show ? "" : "scale-y-[-1]"
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 15.75 7.5-7.5 7.5 7.5"
          />
        </svg>
      </div>
      <h1 className="flex  font-Switzer font-semibold text-6xl lg:text-8xl md:text-8xl py-4 pl-4 lg:mb-24 md:mb-24 mb-20">
        Messenger Stats
      </h1>

      <motion.div {...motionProps}>
        <div className="flex flex-col">
          <div className="md:ml-10 ml-24  flex flex-row w-fulljustify-around ">
            <div className=" flex flex-col gap-4">
              <div className=" lg:h-[200px] md:h-[200px] h-fit w-fit lg:w-[600px] md:w-[600px]  flex  rounded-lg rounded-t-none rounded-br-none flex-col border-2 border-r-0 border-t-0  border-blue-700">
                <div className="bg-blue-700 rounded-tl-none w-full h-14 rounded-t-lg items-center flex pl-2">
                  <h2 className="text-white font-Switzer font-semibold lg:text-3xl md:text-3xl text-2xl tracking-wider">
                    Request Files from Facebook
                  </h2>
                </div>
                <div className="p-2 pt-2 text-slate-500">
                  <p>
                    Facebook takes up to{" "}
                    <strong className="text-white">6 hours</strong> for your
                    files to be ready.
                  </p>
                  <p>
                    {`You will receive a notification when they're ready to be downloaded`}{" "}
                    <a
                      href="https://accountscenter.facebook.com/info_and_permissions/dyi/"
                      className="font-semibold text-blue-700 underline cursor-pointer hover:text-white"
                    >
                      here
                    </a>
                  </p>

                  <p className="absolute lg:pt-20 md:pt-20 pt-14 text-sm w-[180px] md:w-fit lg:w-fit">
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
              <div className="h-fit w-fit flex lg:w-[600px] rounded-lg rounded-t-none rounded-br-none flex-col border-2 border-r-0 border-t-0  border-blue-700">
                <div className="bg-blue-700 rounded-tl-none w-full h-10 rounded-t-lg items-center flex pl-2">
                  <h2 className="text-white font-Switzer font-semibold text-2xl lg:text-3xl tracking-wider">
                    Choose Files
                  </h2>
                </div>
                <div className="p-2 pt-1 pb-0 text-slate-500">
                  <p>
                    <strong>1.</strong> Open the downloaded ZIP file
                  </p>

                  <p>
                    <strong>2.</strong> Select or drop the{" "}
                    <strong className="text-white">{`"your_facebook_activity"`}</strong>{" "}
                    folder in the area below and enter the name of the
                    conversation you want to see the stats of.
                  </p>

                  <p></p>
                </div>

                <div className="flex mt-10 rounded-tr-lg p-2 bg-blue-700 ">
                  <ZipFileDropzone onFilesUploaded={handleFilesUploaded} />
                </div>
              </div>
            </div>

            <div className="invisible lg:visible -translate-y-[100px] flex flex-col scale-75 border-l-2 border-b-2 border-blue-700 rounded-lg rounded-br-none ">
              <div className="bg-blue-700 rounded-t-lg h-12 justify-center place-items-center flex">
                <h1 className=" font-Switzer text-4xl font-semibold tracking-wide ">
                  Demo
                </h1>
              </div>
              <div className="lg:p-10">
                <Suspense fallback={<div>Loading Demo...</div>}>
                  <Demo />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {data ? (
        <MemoizedLists {...listsProps} />
      ) : error ? (
        <div>Error occurred: {error.message}</div>
      ) : (
        <div className="flex justify-center font-semibold">
          Upload folder to see stats
        </div>
      )}
    </main>
  );
}
