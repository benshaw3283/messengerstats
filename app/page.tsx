"use client";
import Tutorial from "@/components/Tutorial";
import React, { MutableRefObject, useEffect } from "react";
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
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [fileMessages, setFileMessages] = React.useState<Message[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [selectedValue, setSelectedValue] = React.useState<number>(0);

  const fileInputRef = React.useRef(null);

  const handleButtonClick = () => {
    // Trigger the click event of the file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (value: string) => {
    setSelectedValue(parseInt(value));
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
    const sortedSenderList = senderList.map(([senderName, messageCount]) => (
      <p key={senderName}>{`${senderName}: ${messageCount}`}</p>
    ));

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
    let maxReactions: number = 0;
    for (const [user, count] of Object.entries(reactionCounts)) {
      if (count > maxReactions) {
        mostReactedUser = user;
        maxReactions = count;
      }
    }

    return mostReactedUser;
  };

  // Find the user who reacted the most
  const reactedMost = findReactedMost(fileMessages);

  const addComma = (count: number) => {
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
    } else {
      withComma = string;
    }
    return withComma;
  };

  React.useEffect(() => {
    readThenSpread();
    readParticipants();
  }, [selectedFiles]);

  return (
    <main className="bg-black text-white min-h-screen">
      <div className="flex flex-col container items-center">
        <h1 className="flex self-center font-bold text-3xl py-4">
          Facebook Messenger Statistics
        </h1>

        <div className="border-4 p-2 rounded-sm">
          <button
            onClick={handleButtonClick}
            className="absolute bg-slate-600 hover:scale-110 w-[109px] h-[30px] rounded-sm font-semibold"
          >
            Choose Files
          </button>
          <input
            type="file"
            ref={fileInputRef}
            directory=""
            webkitdirectory=""
            multiple
            onChange={handleFileSelect}
            className="rounded-sm "
          />
        </div>
        {fileMessages.length === 0 && (
          <p className="text-sm text-muted text-slate-400">
            * Facebook takes about 1 day to have your files ready to download
          </p>
        )}
      </div>
      <div className="border border-white mt-6"></div>

      {selectedFiles.length ? (
        <div className="flex flex-col container items-start">
          <div className="flex flex-row gap-2 py-3 text-2xl font-semibold">
            <p>Total Messages:</p>
            <p>{fileMessages?.length}</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{`Reacted the most messages: ${reactedMost}`}</p>
          </div>
          <div className="pt-5 ">
            <h2 className="font-semibold text-2xl border-b-2 flex justify-center">
              Messages Sent
            </h2>
            <div className="py-3">
              {sortedCount.map((person, index) => (
                <p
                  key={index}
                  className={
                    index === 0 ? "text-xl font-bold " : "font-semibold text-lg"
                  }
                >
                  {`${index + 1}: ${person.name}: ${addComma(person.count)}`}{" "}
                </p>
              ))}
            </div>
          </div>
          <div>
            <div className="flex flex-row border-b-2">
              <h2 className="font-semibold text-xl  pb-1 flex justify-center pr-1">
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
              <p className="font-semibold text-xl  pb-1 flex justify-center pl-1">
                + Reactions
              </p>
            </div>
            <div className="py-3 text-lg font-semibold">
              {" "}
              {fileMessages ? numberReactions(selectedValue) : ""}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="flex text-lg font-semibold justify-center pt-4">
            Upload files to see statistics
          </p>
        </div>
      )}

      <Tutorial />
    </main>
  );
}
