"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Reaction {
  reaction: string;
  actor: string;
}

interface Participant {
  name: string;
}

interface Video {
  creation_timestamp: number | any;
  uri: string;
}

interface Photo {
  creation_timestamp: number | any;
  uri: string;
}

interface Audio {
  creation_timestamp: number | any;
  uri: string;
}

interface Message {
  sender_name: string;
  timestamp_ms: number;
  content?: string;
  reactions: Array<Reaction>;
  is_geoblocked_for_viewer: boolean;
  videos?: Array<Video> | any;
  photos?: Array<Photo> | any;
  audio_files?: Array<Audio> | any;
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
  name: string;
  content: Content;
}

interface Info {
  participants?: Array<Participant>;
  title?: string;
}

interface Props {
  selectedFiles: Array<SelectedFile | any>;
  fileMessages: Array<Message>;
  info: Info;
}

interface Reaction {
  reaction: string;
  actor: string;
}

const getTopReactions = (reactions: Reaction[]) => {
  if (!reactions || reactions.length === 0) return [];

  // Count occurrences of each reaction
  const reactionCount: Record<string, number> = {};
  reactions.forEach(({ reaction }) => {
    reactionCount[reaction] = (reactionCount[reaction] || 0) + 1;
  });

  // Sort reactions by frequency in descending order
  const sortedReactions = Object.entries(reactionCount).sort(
    (a, b) => b[1] - a[1]
  );

  // Return the top 1 or 2 reactions
  return sortedReactions
    .slice(0, 2)
    .map(([reaction]) =>
      new TextDecoder("utf-8").decode(
        new Uint8Array(reaction.split("").map((char) => char.charCodeAt(0)))
      )
    );
};

const Lists: React.FC<Props> = ({ selectedFiles, fileMessages, info }) => {
  const { toast } = useToast();
  const [selectedValue, setSelectedValue] = React.useState<number>(0);

  const div1Ref = React.useRef<any>(null);
  const div2Ref = React.useRef<any>(null);
  const div3Ref = React.useRef<any>(null);

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

  const handleChange = (value: string) => {
    setSelectedValue(parseInt(value));
  };

  const participants = info.participants;

  const messageCounts = participants?.map((participant) => {
    const count = fileMessages?.filter(
      (message) => message.sender_name === participant.name
    ).length;
    return { name: participant.name, count: count };
  });

  const sortedCount = messageCounts?.sort((a, b) => b.count - a.count);

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
              ? "lg:text-2xl text-xl font-bold flex flex-row  w-full h-fit"
              : "font-semibold text-xl flex flex-row  py-1 w-full h-fit"
          }
          key={senderName}
        >
          <div className="w-[50px]">
            <p className="pr-2 flex ">{`${index + 1}.`}</p>
          </div>
          <p className="pr-1 lg:pr-4 flex w-full pl-2 lg:pl-4">{senderName}</p>
          <p className="font-bold text-xl lg:pl-6 pl-2">
            {addComma(messageCount)}
          </p>
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

    return { user: mostReactedUser, count: maxReactions };
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

  const findTopThreeMostReactedPerType = (
    messages: Message[],
    type: string
  ) => {
    // Filter messages based on the type and check for content
    const filteredMessages = messages
      .map((message, index) => {
        const reactionCount = message.reactions?.length || 0;
        let valid = false;
        switch (type) {
          case "video":
            valid =
              message.videos && message.videos.length > 0 && reactionCount > 0;
            break;
          case "photo":
            valid =
              message.photos && message.photos.length > 0 && reactionCount > 0;
            break;
          case "audio":
            valid =
              message.audio_files &&
              message.audio_files.length > 0 &&
              reactionCount > 0;
            break;
        }
        return valid ? { message, index } : null;
      })
      .filter(Boolean) as Array<{ message: Message; index: number }>;

    // Sort filtered messages by the number of reactions in descending order
    const sortedMessages = filteredMessages.sort(
      (a, b) =>
        (b.message.reactions?.length || 0) - (a.message.reactions?.length || 0)
    );

    // Return the top 10 most reacted messages (to check if 7th most reacted exists)
    return sortedMessages.slice(0, 10);
  };

  // Function to find valid files for top messages
  const findFileInSelectedFiles = (messageObj: {
    message: Message;
    index: number;
  }) => {
    const { message, index } = messageObj;
    const file = selectedFiles.find((file) => {
      if (message.photos && message.photos.length > 0) {
        const photoUri = message.photos[0]?.uri;
        const photoFileName = photoUri?.slice(photoUri.lastIndexOf("/") + 1);
        return file.name === photoFileName;
      }
      if (message.videos && message.videos.length > 0) {
        const videoUri = message.videos[0]?.uri;
        const videoFileName = videoUri?.slice(videoUri.lastIndexOf("/") + 1);
        return file.name === videoFileName;
      }
      if (message.audio_files && message.audio_files.length > 0) {
        const audioUri = message.audio_files[0]?.uri;
        const audioFileName = audioUri?.slice(audioUri.lastIndexOf("/") + 1);
        return file.name === audioFileName;
      }
      return false;
    });

    return { message, file: file || null, rank: index + 1 }; // Also return rank
  };

  const topThreeReacted = {
    photos: findTopThreeMostReactedPerType(fileMessages, "photo"),
    videos: findTopThreeMostReactedPerType(fileMessages, "video"),
    audios: findTopThreeMostReactedPerType(fileMessages, "audio"),
  };

  // Use the modified findFileInSelectedFiles
  const mostReactedPhotos = topThreeReacted.photos.map(findFileInSelectedFiles);
  const mostReactedVideos = topThreeReacted.videos.map(findFileInSelectedFiles);
  const mostReactedAudios = topThreeReacted.audios.map(findFileInSelectedFiles);

  // Filter only the valid (non-null) files
  const validReactedPhotos = mostReactedPhotos.filter(({ file }) => file);
  const validReactedVideos = mostReactedVideos.filter(({ file }) => file);
  const validReactedAudios = mostReactedAudios.filter(({ file }) => file);

  /*
  // Cache object URLs for files
  const cachedPhotos = React.useMemo(
    () =>
      mostReactedPhotos.map(({ file }) =>
        file ? URL.createObjectURL(file) : null
      ),
    [mostReactedPhotos]
  );

  const cachedVideos = React.useMemo(
    () =>
      mostReactedVideos.map(({ file }) =>
        file ? URL.createObjectURL(file) : null
      ),
    [mostReactedVideos]
  );

  const cachedAudios = React.useMemo(
    () =>
      mostReactedAudios.map(({ file }) =>
        file ? URL.createObjectURL(file) : null
      ),
    [mostReactedAudios]
  );
  */

  return (
    <div className="pt-10 pb-10">
      <div className="flex flex-col items-center ">
        <section
          className={`bg-neutral-100 p-3 ${
            info?.title?.length! > 10
              ? "rounded-lg"
              : "rounded-lg rounded-b-none"
          } mt-2 border-2 border-blue-700 `}
        >
          <div className="bg-blue-700 rounded-sm p-4  z-10">
            <h1 className="lg:text-5xl text-4xl font-semibold p-3 rounded-lg">
              {info.title}
            </h1>
          </div>
        </section>
        <section
          className={`bg-neutral-100 -translate-y-4 mt-[14px] p-2 rounded-lg ${
            info?.title?.length! > 10 ? "rounded-t-none" : ""
          } border-2 border-t-0 border-blue-700`}
        >
          <div className="flex flex-row gap-2 py-3 text-2xl font-semibold pt-5 bg-blue-700 rounded-sm p-2  z-10">
            <p>Total Messages:</p>
            <p>{addComma(fileMessages?.length)}</p>
          </div>
        </section>
        <div className="pt-3 pb-3">
          <p className="text-lg font-semibold">{`Reacted to the most messages: ${reactedMost.user} (${reactedMost.count} reactions)`}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Tabs
          defaultValue="total"
          className="lg:w-[600px] md:w-[600px] w-[450px] "
        >
          <TabsList className="lg:w-[600px] md:w-[600px] w-[450px] ">
            <TabsTrigger
              value="total"
              className="lg:w-[200px] md:w-[200px] w-[150px] lg:text-lg font-Switzer text-blue-700  tracking-wide"
            >
              Messages Sent
            </TabsTrigger>
            <TabsTrigger
              value="reactions"
              className="lg:w-[200px] md:w-[200px] w-[150px] lg:text-lg  font-Switzer text-blue-700  tracking-wide"
            >
              Message Reactions
            </TabsTrigger>
            <TabsTrigger
              value="most"
              className="lg:w-[200px] md:w-[200px] w-[150px] lg:text-lg  font-Switzer text-blue-700  tracking-wide"
            >
              Most Reactions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="total">
            <div
              id="CONTAINER"
              className=" flex lg:flex-row gap-4 lg:gap-0 flex-col w-full  justify-center mt-4"
            >
              <div className="bg-neutral-100 p-3 rounded-lg flex order-1 h-fit w-fit self-center lg:self-start border-2 border-blue-700">
                <div
                  ref={div1Ref}
                  className="pt-5 bg-blue-700 lg:w-[500px] w-[450px] rounded-lg p-10 pb-2 h-fit z-10 flex flex-col "
                >
                  <h2 className="font-semibold text-2xl pb-1 border-b-2 flex justify-center">
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
                      onClick={() =>
                        copyToClipboard(div1Ref.current?.innerText)
                      }
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      />
                    </svg>
                  </span>

                  <div className="py-3 ">
                    {sortedCount?.map((person, index) => (
                      <div
                        key={index}
                        className={
                          index === 0
                            ? "text-xl lg:text-2xl font-bold flex flex-row justify-start w-full"
                            : "font-semibold text-xl flex flex-row justify-start py-1 w-full"
                        }
                      >
                        <div className="w-[50px]">
                          <p className="pr-2 ">{`${index + 1}.`}</p>
                        </div>

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
            </div>
          </TabsContent>
          <TabsContent value="reactions">
            <div className="flex flex-col  items-center order-3 mt-4 ">
              <div
                ref={div3Ref}
                className="bg-neutral-100 p-3 rounded-lg border-2 border-blue-700"
              >
                <div className="pt-5 bg-blue-700 lg:w-[500px] w-[450px] rounded-lg p-10 pb-2 z-10 ">
                  <div className="flex flex-row border-b-2 justify-center ">
                    <h2 className="font-semibold lg:text-2xl text-base pb-1 flex  pr-1">
                      Messages with
                    </h2>
                    <Select onValueChange={(v: any) => handleChange(v)}>
                      <SelectTrigger className="w-[60px]  h-[26px] text-black font-semibold">
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
                        <SelectItem value="31">31</SelectItem>
                        <SelectItem value="32">32</SelectItem>
                        <SelectItem value="33">33</SelectItem>
                        <SelectItem value="34">34</SelectItem>
                        <SelectItem value="35">35</SelectItem>
                        <SelectItem value="36">36</SelectItem>
                        <SelectItem value="37">37</SelectItem>
                        <SelectItem value="38">38</SelectItem>
                        <SelectItem value="39">39</SelectItem>
                        <SelectItem value="40">40</SelectItem>
                        <SelectItem value="41">41</SelectItem>
                        <SelectItem value="42">42</SelectItem>
                        <SelectItem value="43">43</SelectItem>
                        <SelectItem value="44">44</SelectItem>
                        <SelectItem value="45">45</SelectItem>
                        <SelectItem value="46">46</SelectItem>
                        <SelectItem value="47">47</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                        <SelectItem value="49">49</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="51">51</SelectItem>
                        <SelectItem value="52">52</SelectItem>
                        <SelectItem value="53">53</SelectItem>
                        <SelectItem value="54">54</SelectItem>
                        <SelectItem value="55">55</SelectItem>
                        <SelectItem value="56">56</SelectItem>
                        <SelectItem value="57">57</SelectItem>
                        <SelectItem value="58">58</SelectItem>
                        <SelectItem value="59">59</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                        <SelectItem value="61">61</SelectItem>
                        <SelectItem value="62">62</SelectItem>
                        <SelectItem value="63">63</SelectItem>
                        <SelectItem value="64">64</SelectItem>
                        <SelectItem value="65">65</SelectItem>
                        <SelectItem value="66">66</SelectItem>
                        <SelectItem value="67">67</SelectItem>
                        <SelectItem value="68">68</SelectItem>
                        <SelectItem value="69">69</SelectItem>
                        <SelectItem value="70">70</SelectItem>
                        <SelectItem value="71">71</SelectItem>
                        <SelectItem value="72">72</SelectItem>
                        <SelectItem value="73">73</SelectItem>
                        <SelectItem value="74">74</SelectItem>
                        <SelectItem value="75">75</SelectItem>
                        <SelectItem value="76">76</SelectItem>
                        <SelectItem value="77">77</SelectItem>
                        <SelectItem value="78">78</SelectItem>
                        <SelectItem value="79">79</SelectItem>
                        <SelectItem value="80">80</SelectItem>
                        <SelectItem value="81">81</SelectItem>
                        <SelectItem value="82">82</SelectItem>
                        <SelectItem value="83">83</SelectItem>
                        <SelectItem value="84">84</SelectItem>
                        <SelectItem value="85">85</SelectItem>
                        <SelectItem value="86">86</SelectItem>
                        <SelectItem value="87">87</SelectItem>
                        <SelectItem value="88">88</SelectItem>
                        <SelectItem value="89">89</SelectItem>
                        <SelectItem value="90">90</SelectItem>
                        <SelectItem value="91">91</SelectItem>
                        <SelectItem value="92">92</SelectItem>
                        <SelectItem value="93">93</SelectItem>
                        <SelectItem value="94">94</SelectItem>
                        <SelectItem value="95">95</SelectItem>
                        <SelectItem value="96">96</SelectItem>
                        <SelectItem value="97">97</SelectItem>
                        <SelectItem value="98">98</SelectItem>
                        <SelectItem value="99">99</SelectItem>
                        <SelectItem value="100">100</SelectItem>
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
                  <div className="flex flex-col  w-full">
                    <div className="py-3 text-lg font-semibold flex flex-col ">
                      {" "}
                      {fileMessages ? numberReactions(selectedValue) : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="most">
            <div id="message"></div>

            <div id="photo" className="border-t-2 border-slate-600 mt-4">
              <div className="flex justify-center py-4">
                <h2 className="text-xl  font-Switzer tracking-wider bg-blue-700 rounded-sm p-2  w-fit border-2 border-white justify-center flex">
                  Images
                </h2>
              </div>
              <Carousel
                orientation="horizontal"
                opts={{ align: "center", loop: false }}
                className="w-full max-w-lg ml-10 "
              >
                <CarouselContent className="-ml-1">
                  {validReactedPhotos?.map(({ file, message }, index) => (
                    <CarouselItem key={index}>
                      <div className="pb-1">
                        <p className="font-semibold">
                          {(index === 0 && "Most reacted image") ||
                            (index === 1 && "2nd most reacted image") ||
                            (index === 2 && "3rd most reacted image") ||
                            (index === 3 && "4th most reacted image") ||
                            (index === 4 && "5th most reacted image") ||
                            (index === 5 && "6th most reacted image") ||
                            (index === 6 && "7th most reacted image") ||
                            (index === 7 && "8th most reacted image")}
                        </p>
                        <div className="flex-row flex justify-between">
                          <p>{`Sent by ${message.sender_name}`}</p>
                          <div className="w-fit px-1 h-6 bg-white rounded-full flex ">
                            <p className="text-blue-700  font-semibold">
                              {message.reactions.length}
                              {getTopReactions(message.reactions)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {file ? (
                        <Image
                          loading="lazy"
                          src={URL.createObjectURL(file)}
                          alt="most reacted photo"
                          width={500}
                          height={500}
                        />
                      ) : (
                        <p>Image not found</p>
                      )}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-blue-700" />
                <CarouselNext className="text-blue-700" />
              </Carousel>
            </div>
            <div id="video" className="border-t-2 border-slate-600 mt-4">
              <div className="flex justify-center py-4">
                <h2 className="text-xl  font-Switzer tracking-wider bg-blue-700 rounded-sm p-2  w-fit border-2 border-white justify-center flex">
                  Videos
                </h2>
              </div>
              <Carousel
                orientation="horizontal"
                opts={{ align: "center", loop: false }}
                className="w-full max-w-lg ml-10 "
              >
                <CarouselContent className="-ml-1">
                  {validReactedVideos?.map(({ file, message }, index) => (
                    <CarouselItem key={index}>
                      <div className="pb-1">
                        <p className="font-semibold">
                          {(index === 0 && "Most reacted video") ||
                            (index === 1 && "2nd most reacted video") ||
                            (index === 2 && "3rd most reacted video") ||
                            (index === 3 && "4th most reacted video") ||
                            (index === 4 && "5th most reacted video") ||
                            (index === 5 && "6th most reacted video") ||
                            (index === 6 && "7th most reacted video") ||
                            (index === 7 && "8th most reacted video")}
                        </p>
                        <div className="flex-row flex justify-between">
                          <p>{`Sent by ${message.sender_name}`}</p>
                          <div className="w-fit px-1 h-6 bg-white rounded-full flex ">
                            <p className="text-blue-700  font-semibold">
                              {message.reactions.length}
                              {getTopReactions(message.reactions)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center items-center">
                        {file ? (
                          <video
                            width="320"
                            height="240"
                            controls
                            preload="auto"
                            crossOrigin="anonymous"
                            playsInline
                            className="rounded-lg shadow-md"
                          >
                            <source
                              src={URL.createObjectURL(file)}
                              type="video/mp4"
                            />
                            Videos not supported
                          </video>
                        ) : (
                          <p>Video not found</p>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-blue-700" />
                <CarouselNext className="text-blue-700" />
              </Carousel>
            </div>

            <div id="audio" className="border-t-2 border-slate-600 mt-4">
              <div className="flex justify-center py-4">
                <h2 className="text-xl  font-Switzer tracking-wider bg-blue-700 rounded-sm p-2  w-fit border-2 border-white justify-center flex">
                  Audio
                </h2>
              </div>
              <Carousel
                orientation="horizontal"
                opts={{ align: "center", loop: false }}
                className="w-full max-w-lg ml-10 "
              >
                <CarouselContent className="-ml-1">
                  {validReactedAudios?.map(({ file, message }, index) => (
                    <CarouselItem key={index}>
                      <div className="pb-1">
                        <p className="font-semibold">
                          {(index === 0 && "Most reacted audio") ||
                            (index === 1 && "2nd most reacted audio") ||
                            (index === 2 && "3rd most reacted audio") ||
                            (index === 3 && "4th most reacted audio") ||
                            (index === 4 && "5th most reacted audio") ||
                            (index === 5 && "6th most reacted audio") ||
                            (index === 6 && "7th most reacted audio") ||
                            (index === 7 && "8th most reacted audio")}
                        </p>
                        <div className="flex-row flex justify-between">
                          <p>{`Sent by ${message.sender_name}`}</p>
                          <div className="w-fit px-1 h-6 bg-white rounded-full flex ">
                            <p className="text-blue-700  font-semibold">
                              {message.reactions.length}
                              {getTopReactions(message.reactions)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center items-center">
                        {file ? (
                          <audio
                            src={URL.createObjectURL(file)}
                            controls
                          ></audio>
                        ) : (
                          <p>Audio not found</p>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-blue-700" />
                <CarouselNext className="text-blue-700" />
              </Carousel>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Lists;
