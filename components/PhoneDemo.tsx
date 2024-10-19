"use client";
import React, { memo } from "react"; // Change this line to include memo
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
const utf = "\u00f0\u009f\u0098\u0086";
const utf2 = "\u00f0\u009f\u0091\u008d";
const byteArray = utf.split("").map((char) => char.charCodeAt(0));
const byteArray2 = utf2.split("").map((char) => char.charCodeAt(0));
const laughEmoji = new TextDecoder("utf-8").decode(new Uint8Array(byteArray));
const thumbEmoji = new TextDecoder("utf-8").decode(new Uint8Array(byteArray2));

const PhoneDemo = () => {
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

  return (
    <div>
      <Dialog>
        <DialogTrigger className="hover:text-white">Demo</DialogTrigger>
        <DialogContent className="bg-slate-950 h-[90%] overflow-y-scroll overflow-x-hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>

          <div className="w-[60%]  scale-75 md:scale-90 -translate-y-14  translate-x-14">
            <div className="flex flex-col items-center">
              <section className="bg-neutral-100 p-3 rounded-lg mt-2 border-2 border-blue-700">
                <div className="bg-blue-700 rounded-sm p-4  z-10">
                  <h1 className="lg:text-5xl text-4xl font-semibold p-3 rounded-lg">
                    Group Name
                  </h1>
                </div>
              </section>
              <section className="bg-neutral-100 p-2 rounded-lg mt-2 border-2 border-blue-700">
                <div className="flex flex-row gap-2 py-3 text-2xl font-semibold pt-5 bg-blue-700 rounded-sm p-2  z-10">
                  <p>Total Messages:</p>
                  <p>34,790</p>
                </div>
              </section>
              <div className="pt-3 pb-3">
                <p className="text-lg font-semibold text-white">{`Reacted to the most messages: Jon Snow (8,888 reactions)`}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Tabs defaultValue="total" className="w-[600px] pr-5">
                <TabsList className="w-[600px] md:w-full ">
                  <TabsTrigger
                    value="total"
                    className="w-[200px] md:w-1/3 text-lg font-Switzer text-blue-700  tracking-wide"
                  >
                    Messages Sent
                  </TabsTrigger>
                  <TabsTrigger
                    value="reactions"
                    className="w-[200px] md:w-1/3 text-lg  font-Switzer text-blue-700  tracking-wide"
                  >
                    Message Reactions
                  </TabsTrigger>
                  <TabsTrigger
                    value="most"
                    className="w-[200px] md:w-1/3 text-lg  font-Switzer text-blue-700  tracking-wide"
                  >
                    Most Reactions
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="total">
                  <div
                    id="CONTAINER"
                    className=" flex lg:flex-row gap-4 lg:gap-0 flex-col w-full justify-center mt-4"
                  >
                    <div className="bg-neutral-100 p-3 rounded-lg flex order-1 h-fit w-fit self-center lg:self-start border-2 border-blue-700">
                      <div
                        ref={div1Ref}
                        className="pt-5 bg-blue-700 text-white w-[500px] rounded-lg p-10 pb-2 h-fit z-10 flex flex-col "
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
                          {array.map((person, index) => (
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
                      className="bg-neutral-100 text-white p-3 rounded-lg border-2 border-blue-700"
                    >
                      <div className="pt-5 bg-blue-700 w-[500px] rounded-lg p-10 pb-2  z-10 ">
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
                            <div className="lg:text-2xl text-xl font-bold flex flex-row  w-full h-fit">
                              <div className="w-[50px]">
                                <p className="pr-2 flex ">{`1.`}</p>
                              </div>
                              <p className="pr-1 lg:pr-4 flex w-full pl-2 lg:pl-4">
                                John Pork
                              </p>
                              <p className="font-bold text-xl lg:pl-6 pl-2">
                                {selectedValue === 1 && addComma(2000)}
                                {selectedValue === 2 && addComma(2000 / 2)}
                                {selectedValue === 3 && addComma(660)}
                              </p>
                            </div>
                            <div className="font-semibold text-xl flex flex-row  py-1 w-full h-fit">
                              <div className="w-[50px]">
                                <p className="pr-2 flex ">{`2.`}</p>
                              </div>
                              <p className="pr-1 lg:pr-4 flex w-full pl-2 lg:pl-4">
                                Jon Snow
                              </p>
                              <p className="font-bold text-xl lg:pl-6 pl-2">
                                {selectedValue === 1 && addComma(1423)}
                                {selectedValue === 2 && addComma(711)}
                                {selectedValue === 3 && addComma(474)}
                              </p>
                            </div>
                            <div className="font-semibold text-xl flex flex-row  py-1 w-full h-fit">
                              <div className="w-[50px]">
                                <p className="pr-2 flex ">{`3.`}</p>
                              </div>
                              <p className="pr-1 lg:pr-4 flex w-full pl-2 lg:pl-4">
                                Charlie Johnson
                              </p>
                              <p className="font-bold text-xl lg:pl-6 pl-2">
                                {selectedValue === 1 && addComma(1288)}
                                {selectedValue === 2 && addComma(1288 / 2)}
                                {selectedValue === 3 && addComma(429)}
                              </p>
                            </div>
                            <div className="font-semibold text-xl flex flex-row  py-1 w-full h-fit">
                              <div className="w-[50px]">
                                <p className="pr-2 flex ">{`4.`}</p>
                              </div>
                              <p className="pr-1 lg:pr-4 flex w-full pl-2 lg:pl-4">
                                Diana Clark
                              </p>
                              <p className="font-bold text-xl lg:pl-6 pl-2">
                                {selectedValue === 1 && addComma(986)}
                                {selectedValue === 2 && addComma(986 / 2)}
                                {selectedValue === 3 && addComma(328)}
                              </p>
                            </div>
                            <div className="font-semibold text-xl flex flex-row  py-1 w-full h-fit">
                              <div className="w-[50px]">
                                <p className="pr-2 flex ">{`5.`}</p>
                              </div>
                              <p className="pr-1 lg:pr-4 flex w-full pl-2 lg:pl-4">
                                Ethan White
                              </p>
                              <p className="font-bold text-xl lg:pl-6 pl-2">
                                {selectedValue === 1 && addComma(560)}
                                {selectedValue === 2 && addComma(560 / 2)}
                                {selectedValue === 3 && addComma(186)}
                              </p>
                            </div>
                            <div className="font-semibold text-xl flex flex-row  py-1 w-full h-fit">
                              <div className="w-[50px]">
                                <p className="pr-2 flex ">{`6.`}</p>
                              </div>
                              <p className="pr-1 lg:pr-4 flex w-full pl-2 lg:pl-4">
                                Fiona King
                              </p>
                              <p className="font-bold text-xl lg:pl-6 pl-2">
                                {selectedValue === 1 && addComma(346)}
                                {selectedValue === 2 && addComma(346 / 2)}
                                {selectedValue === 3 && addComma(115)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="most">
                  <div id="message"></div>
                  <div id="photo" className="border-t-2 border-slate-600 mt-4 ">
                    <div className="flex justify-center py-4">
                      <h2 className="text-xl font-semibold font-Switzer tracking-wider bg-blue-700 rounded-sm p-2  w-fit border-2 border-white justify-center flex">
                        Images
                      </h2>
                    </div>
                    <Carousel
                      orientation="horizontal"
                      opts={{ align: "center", loop: false }}
                      className="w-full max-w-sm ml-20 "
                    >
                      <CarouselContent className="-ml-1">
                        <CarouselItem>
                          <div className="pb-1 text-white">
                            <p className="font-semibold ">Most reacted image</p>
                            <div className="flex-row flex justify-between">
                              <p>Sent by John Pork</p>
                              <div className="w-16 h-6 bg-white rounded-full flex ">
                                <p className="text-blue-700 pl-1 font-semibold">{`5 ${laughEmoji}${thumbEmoji}`}</p>
                              </div>
                            </div>
                          </div>
                          <Image
                            src="/demo_image_1.webp"
                            alt="most reacted photo"
                            width={500}
                            height={500}
                          />
                        </CarouselItem>
                        <CarouselItem>
                          <div className="pb-1 text-white">
                            <p className="font-semibold">
                              2nd most reacted image
                            </p>
                            <div className="flex-row flex justify-between">
                              <p>Sent by John Pork</p>
                              <div className="w-16 h-6 bg-white rounded-full flex ">
                                <p className="text-blue-700 pl-1 font-semibold">{`3 ${laughEmoji}${thumbEmoji}`}</p>
                              </div>
                            </div>
                          </div>
                          <Image
                            src="/demo_image_2.jpg"
                            alt="2nd most reacted photo"
                            width={500}
                            height={500}
                          />
                          <div></div>
                        </CarouselItem>
                        <CarouselItem>
                          <div className="pb-1 text-white">
                            <p className="font-semibold">
                              3rd most reacted image
                            </p>
                            <div className="flex-row flex justify-between">
                              <p>Sent by John Pork</p>
                              <div className="w-16 h-6 bg-white rounded-full flex ">
                                <p className="text-blue-700 pl-1 font-semibold">{`2 ${laughEmoji}${thumbEmoji}`}</p>
                              </div>
                            </div>
                          </div>
                          <Image
                            src="/demo_image_3.jpg"
                            alt="3rd most reacted photo"
                            width={500}
                            height={500}
                          />
                        </CarouselItem>
                      </CarouselContent>
                      <CarouselPrevious className="text-blue-700" />
                      <CarouselNext className="text-blue-700" />
                    </Carousel>
                  </div>

                  <div id="video" className="border-t-2 border-slate-600 my-4">
                    <div className="flex justify-center py-4">
                      <h2 className="text-xl font-semibold font-Switzer tracking-wider bg-blue-700 rounded-sm p-2  w-fit border-2 border-white justify-center flex">
                        Videos
                      </h2>
                    </div>
                    <Carousel
                      orientation="horizontal"
                      opts={{ align: "center", loop: false }}
                      className="w-full  max-w-xs ml-24 "
                    >
                      <CarouselContent className="-ml-1 ">
                        <CarouselItem>
                          <div className="pb-1 text-white">
                            <p className="font-semibold">Most reacted video</p>
                            <div className="flex-row flex justify-between">
                              <p>Sent by John Pork</p>
                              <div className="w-16 h-6 bg-white rounded-full flex ">
                                <p className="text-blue-700 pl-1 font-semibold">{`5 ${laughEmoji}${thumbEmoji}`}</p>
                              </div>
                            </div>
                          </div>

                          <video
                            width="320"
                            height="240"
                            controls
                            preload="auto"
                            crossOrigin="anonymous"
                            playsInline
                          >
                            <source src="/demo_video_1.mp4" type="video/mp4" />
                            Videos not supported
                          </video>
                        </CarouselItem>
                        <CarouselItem>
                          <div className="pb-1 text-white">
                            <p className="font-semibold">
                              2nd most reacted video
                            </p>
                            <div className="flex-row flex justify-between">
                              <p>Sent by John Pork</p>
                              <div className="w-16 h-6 bg-white rounded-full flex ">
                                <p className="text-blue-700 pl-1 font-semibold">{`3 ${laughEmoji}${thumbEmoji}`}</p>
                              </div>
                            </div>
                          </div>
                          <video
                            width="320"
                            height="240"
                            controls
                            preload="auto"
                            crossOrigin="anonymous"
                            playsInline
                          >
                            <source src="/demo_video_2.mp4" type="video/mp4" />
                            Videos not supported
                          </video>
                        </CarouselItem>
                      </CarouselContent>
                      <CarouselPrevious className="text-blue-700" />
                      <CarouselNext className="text-blue-700" />
                    </Carousel>
                  </div>

                  <div id="audio" className="border-t-2 border-slate-600  ">
                    <div className="flex justify-center py-4">
                      <h2 className="text-xl font-semibold font-Switzer tracking-wider bg-blue-700 rounded-sm p-2  w-fit border-2 border-white justify-center flex">
                        Audio
                      </h2>
                    </div>
                    <Carousel
                      orientation="horizontal"
                      opts={{ align: "center", loop: false }}
                      className="w-full  max-w-xs ml-24 "
                    >
                      <CarouselContent className="-ml-1">
                        <CarouselItem>
                          <div className="pb-1 text-white">
                            <p className="font-semibold">Most reacted audio</p>
                            <div className="flex-row flex justify-between">
                              <p>Sent by John Pork</p>
                              <div className="w-16 h-6 bg-white rounded-full flex ">
                                <p className="text-blue-700 pl-1 font-semibold">{`5 ${laughEmoji}${thumbEmoji}`}</p>
                              </div>
                            </div>
                          </div>

                          <audio controls src="/demo_audio_1.wav"></audio>
                        </CarouselItem>
                      </CarouselContent>
                      <CarouselPrevious className="text-blue-700" />
                      <CarouselNext className="text-blue-700" />
                    </Carousel>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhoneDemo;

const array = [
  { name: "John Pork", count: 9137 },
  { name: "Jon Snow ", count: 8246 },
  { name: "Charlie Johnson", count: 7321 },
  { name: "Diana Clark", count: 5489 },
  { name: "Ethan White", count: 2643 },
  { name: "Fiona King", count: 1954 },
];
