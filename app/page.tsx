"use client";
import Tutorial from "@/components/Tutorial";
import { useToast } from "@/components/ui/use-toast";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function Home() {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [fileMessages, setFileMessages] = React.useState<Message[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [selectedValue, setSelectedValue] = React.useState<number>(0);
  const [selectedWord, setSelectedWord] = React.useState<FormData>();
  const convoTitleRef = React.useRef<string>("");
  const fileInputRef = React.useRef(null);
  const div1Ref = React.useRef<any>(null);
  const div2Ref = React.useRef<any>(null);
  const div3Ref = React.useRef<any>(null);

  // let folderName = selectedFiles[0];

  const handleButtonClick = () => {
    // Trigger the click event of the file input
    if (fileInputRef.current) {
      (fileInputRef?.current as HTMLInputElement).click();
    }
  };

  const handleChange = (value: string) => {
    setSelectedValue(parseInt(value));
  };

  const handleWordChange = (formData: FormData) => {
    const word: any = formData.get("wordSearch");
    setSelectedWord(word);
  };

  const handleFileSelect = async (event: any) => {
    const files = event.target.files; // Access the FileList object

    // Convert the FileList object to an array
    const fileListArray: File[] = Array.from(files);

    // Update state to store the array of selected files
    setSelectedFiles(fileListArray);
  };

  const readParticipants = async () => {
    try {
      // Find the file object for message_1.json
      const message1File = selectedFiles.find(
        (file) => file.name === "message_1.json"
      );
      if (!message1File) {
        console.error("message_1.json not found in selected files.");
        return;
      }

      const reader = new FileReader();
      const blob = new Blob([message1File], { type: message1File.type });

      reader.onload = (event: any) => {
        const fileContents = event.target.result;
        try {
          const jsonData = JSON.parse(fileContents);
          const participantsArray = jsonData.participants;
          setParticipants(participantsArray);
          console.log("Participants array:", participantsArray);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      reader.readAsText(blob);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const readThenSpread = async () => {
    selectedFiles.forEach((file, index) => {
      const currentFile = selectedFiles[index];
      const reader = new FileReader();

      // Create a Blob object from the File object
      const blob = new Blob([currentFile], { type: currentFile.type });

      reader.onload = (event: any) => {
        const fileContents = event.target.result;

        try {
          const jsonData = JSON.parse(fileContents);
          convoTitleRef.current = jsonData.title;
          const spread: any = [...jsonData.messages];
          setFileMessages((prev) => [...prev, ...spread]);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      // Pass the Blob object to readAsText()
      reader.readAsText(blob);
    });
  };

  const messageCounts = participants.map((participant) => {
    const count = fileMessages?.filter(
      (message) => message.sender_name === participant.name
    ).length;
    return { name: participant.name, count: count };
  });

  const sortedCount = messageCounts.sort((a, b) => b.count - a.count);

  const numberReactions = (number: number) => {
    // Function to find messages with number or more reactions
    const findMessagesWithNumberPlusReactions = (messages: any) => {
      const messagesWithNumberPlusReactions = messages.filter(
        (message: Message) =>
          message?.reactions && message.reactions.length >= number
      );
      return messagesWithNumberPlusReactions;
    };

    // Get messages with number or more reactions
    const messagesWithNumberPlusReactions =
      findMessagesWithNumberPlusReactions(fileMessages);

    // Create a map to count messages by sender
    const messagesCountBySender: any = {};
    messagesWithNumberPlusReactions.forEach((message: Message) => {
      const senderName = message.sender_name;
      if (!messagesCountBySender[senderName]) {
        messagesCountBySender[senderName] = 1;
      } else {
        messagesCountBySender[senderName]++;
      }
    });

    // Convert messagesCountBySender to an array for sorting
    const senderList = Object.entries(messagesCountBySender);

    // Sort senderList by message count
    senderList.sort((a: any, b: any) => b[1] - a[1]);

    // Render the sorted list of senders and their message counts
    const sortedSenderList = senderList.map(
      ([senderName, messageCount], index) => (
        <div
          className={
            index === 0
              ? "lg:text-2xl text-xl font-bold flex flex-row justify-start w-full h-fit"
              : "font-semibold text-xl flex flex-row justify-start py-1 w-full h-fit"
          }
          key={senderName}
        >
          <p className="pr-2 flex ">{`${index + 1}.`}</p>
          <p className="pr-4 flex pl-2 lg:pl-4  w-full">{senderName}</p>
          <p className="font-bold text-xl lg:pl-6 pl-2">
            {addComma(messageCount)}
          </p>
        </div>
      )
    );

    return sortedSenderList;
  };

  const wordOccurrences = (word: string | any) => {
    // Function to find messages containing the specified word/s
    const findMessagesWithWord = (messages: any) => {
      const messagesWithWord = messages.filter(
        (message: Message) => message?.content && message.content.includes(word)
      );
      return messagesWithWord;
    };

    // Get messages containing the specified word
    const messagesWithWord = findMessagesWithWord(fileMessages);

    // Create a map to count messages by sender
    const messagesCountBySender: any = {};
    messagesWithWord.forEach((message: Message) => {
      const senderName = message.sender_name;
      if (!messagesCountBySender[senderName]) {
        messagesCountBySender[senderName] = 1;
      } else {
        messagesCountBySender[senderName]++;
      }
    });

    // Convert messagesCountBySender to an array for sorting
    const senderList = Object.entries(messagesCountBySender);

    // Sort senderList by message count
    senderList.sort((a: any, b: any) => b[1] - a[1]);

    // Render the sorted list of senders and their message counts
    const sortedSenderList = senderList.map(
      ([senderName, messageCount], index) => (
        <div
          className={
            index === 0
              ? "text-2xl font-bold flex flex-row justify-start w-full"
              : "font-semibold text-xl flex flex-row justify-start py-1 w-full"
          }
          key={senderName}
        >
          <p className="pr-2 ">{`${index + 1}.`}</p>
          <p className="pr-4 flex w-full lg:pl-4 pl-2">{senderName}</p>
          <p className="font-bold text-xl pl-4">{addComma(messageCount)}</p>
        </div>
      )
    );

    return sortedSenderList;
  };

  // Function to find the user who reacted the most
  const findReactedMost = (messages: Message[]) => {
    const reactionCounts: any = {};
    messages.forEach((message) => {
      if (message.reactions) {
        message.reactions.forEach((reaction) => {
          const user = reaction.actor;
          if (!reactionCounts[user]) {
            reactionCounts[user] = 1;
          } else {
            reactionCounts[user]++;
          }
        });
      }
    });

    let mostReactedUser = null;
    let maxReactions: any = 0;
    for (const [user, count] of Object.entries(reactionCounts)) {
      if ((count as number) > maxReactions) {
        mostReactedUser = user;
        maxReactions = count as number;
      }
    }

    return mostReactedUser;
  };

  // Find the user who reacted the most
  const reactedMost = findReactedMost(fileMessages);

  const addComma = (count: any | unknown) => {
    let withComma = "";
    const string = count.toString();
    if (string.length === 5) {
      withComma = `${string.charAt(0)}${string.charAt(1)},${string.charAt(
        2
      )}${string.charAt(3)}${string.charAt(4)}`;
    } else if (string.length === 4) {
      withComma = `${string.charAt(0)},${string.charAt(1)}${string.charAt(
        2
      )}${string.charAt(3)}`;
    } else if (string.length === 6) {
      withComma = `${string.charAt(0)}${string.charAt(1)}${string.charAt(
        2
      )},${string.charAt(3)}${string.charAt(4)}${string.charAt(5)}`;
    } else {
      withComma = string;
    }
    return withComma;
  };

  const copyToClipboard = async (text: any) => {
    try {
      navigator.clipboard.writeText(
        text
          .replace(/\n/g, " ")
          .split(/\d+\./)
          .filter((line: any) => line.trim().length > 0)
          .map((line: any) => line.trim())
          .join("\n")
      );
      toast({
        title: "Copied to clipboard",
      });
    } catch (error) {
      alert(error);
    }
  };

  React.useEffect(() => {
    readThenSpread();
    readParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  return (
    <main className="bg-slate-950 text-white">
      <div ref={div1Ref} className="flex flex-col container items-center">
        <h1 className="flex self-center font-bold lg:text-3xl text-2xl py-4">
          Facebook Messenger Stats
        </h1>

        <div className="flex justify-center items-center">
          <div className="border-4 p-2 rounded-sm bg-white w-[225px]  h-[60px] flex">
            <button
              onClick={handleButtonClick}
              className="absolute bg-blue-700  hover:scale-110  w-[200px] h-[50px] rounded-sm font-semibold self-center "
            >
              Choose Files
            </button>

            <input
              type="file"
              ref={fileInputRef}
              // @ts-ignore
              directory=""
              webkitdirectory=""
              multiple
              onChange={handleFileSelect}
              className="rounded-sm w-[110px] hidden"
            />
          </div>
        </div>
        {fileMessages.length === 0 && (
          <p className="text-sm text-muted text-slate-400 mt-3">
            * Facebook takes about 1 day to have your files ready to download
          </p>
        )}
      </div>
      <div className="border border-white mt-6"></div>

      {selectedFiles.length ? (
        <div className="flex flex-col items-center ">
          <section className="bg-neutral-100 p-4 rounded-lg mt-2 border-2 border-blue-700">
            <div className="bg-blue-700 rounded-lg p-4   z-10">
              <h1 className="lg:text-5xl text-4xl font-semibold p-3  rounded-lg">
                {convoTitleRef.current}
              </h1>
            </div>
          </section>
          <section className="bg-neutral-100 p-2 rounded-lg mt-2 border-2 border-blue-700">
            <div className="flex flex-row gap-2 py-3 text-2xl font-semibold pt-5 bg-blue-700 rounded-lg p-2  z-10">
              <p>Total Messages:</p>
              <p>{addComma(fileMessages?.length)}</p>
            </div>
          </section>
          <div>
            <p className="text-lg font-semibold">{`Reacted the most messages: ${reactedMost}`}</p>
          </div>
          <div
            id="CONTAINER"
            className=" flex lg:flex-row gap-4 lg:gap-0 flex-col w-full justify-around mt-10"
          >
            <div className="bg-neutral-100 p-4 rounded-lg flex order-1 h-fit w-fit self-center lg:self-start border-2 border-blue-700">
              <div
                ref={div1Ref}
                className="pt-5 bg-blue-700 rounded-lg p-10 h-fit z-10 flex flex-col "
              >
                <h2 className="font-semibold text-2xl border-b-2 flex justify-center">
                  Messages Sent
                </h2>
                <span className="relative flex self-end items-end -top-5 left-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 absolute cursor-pointer hover:scale-105"
                    onClick={() => copyToClipboard(div1Ref.current?.innerText)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                    />
                  </svg>
                </span>

                <div className="py-3 ">
                  {sortedCount.map((person, index) => (
                    <div
                      key={index}
                      className={
                        index === 0
                          ? "text-xl lg:text-2xl font-bold flex flex-row justify-start w-full"
                          : "font-semibold text-xl flex flex-row justify-start py-1 w-full"
                      }
                    >
                      <p className="pr-2 ">{`${index + 1}.`}</p>

                      <p className="pr-1 lg:pr-4 flex w-full pl-2 lg:pl-4">
                        {person.name}
                      </p>

                      <p className="font-bold text-xl lg:pl-6 pl-2">
                        {addComma(person.count)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col  items-center order-3 mt-10 lg:mt-0">
              <div
                ref={div3Ref}
                className="bg-neutral-100 p-4 rounded-lg border-2 border-blue-700"
              >
                <div className="pt-5 bg-blue-700 rounded-lg p-10  z-10 ">
                  <div className="flex flex-row border-b-2">
                    <h2 className="font-semibold lg:text-xl text-base pb-1 flex justify-center pr-1">
                      Messages with
                    </h2>
                    <Select onValueChange={(v: any) => handleChange(v)}>
                      <SelectTrigger className="w-[60px] h-[25px] text-black">
                        <SelectValue placeholder="1" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="13">13</SelectItem>
                        <SelectItem value="14">14</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="17">17</SelectItem>
                        <SelectItem value="18">18</SelectItem>
                        <SelectItem value="19">19</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="21">21</SelectItem>
                        <SelectItem value="22">22</SelectItem>
                        <SelectItem value="23">23</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="26">26</SelectItem>
                        <SelectItem value="27">27</SelectItem>
                        <SelectItem value="28">28</SelectItem>
                        <SelectItem value="29">29</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="font-semibold lg:text-xl text-base pb-1 flex justify-center pl-1">
                      + Reactions
                    </p>
                  </div>
                  <span className="relative flex justify-end  items-end -top-5 left-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 absolute cursor-pointer hover:scale-105"
                      onClick={() =>
                        copyToClipboard(div3Ref.current?.innerText)
                      }
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      />
                    </svg>
                  </span>
                  <div className="flex flex-col items-center">
                    <div className="py-3 text-lg font-semibold flex flex-col items-start">
                      {" "}
                      {fileMessages ? numberReactions(selectedValue) : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="flex text-lg font-semibold justify-center pt-4">
            Upload files to see stats
          </p>
        </div>
      )}

      <Tutorial />
    </main>
  );
}
