import React from "react";
import Image from "next/image";

const Tutorial = () => {
  return (
    <div className="pt-10 flex  items-center flex-col bg-slate-950 text-white">
      <div className="border border-slate-300 w-full mb-6"></div>
      <div className="bg-white p-2 w-fit items-center rounded-lg flex border-2 border-blue-700">
        <div className=" bg-blue-700 rounded-lg p-3 h-fit z-10">
          <h1 className="flex justify-center self-center text-4xl font-semibold ">
            Tutorial
          </h1>
        </div>
      </div>

      <div className="flex flex-col pl-3 ">
        <div className="pt-6 flex flex-col items-center">
          <h1 className="text-2xl font-semibold border-b w-fit border-slate-300">
            Step 1
          </h1>
          <p>Go on Facebook and click your profile picture in the top right.</p>
          <p>
            Click <strong>Settings & Privacy</strong>
          </p>

          <p className="flex flex-row gap-[18px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
            <strong>Settings</strong>
          </p>
          <p>
            Then scroll down the left and click on{" "}
            <strong>Download your information</strong>
          </p>
          <Image
            src="/step1.4.PNG"
            alt="step1.3"
            width={300}
            height={300}
            className="pl-1"
          />
          <p className="pt-2">
            Enter your password and then click the{" "}
            <strong>Download or transfer information</strong> button shown below
          </p>
          <Image src="/step1.6.PNG" alt="step" width={300} height={300} />
          <p className="pt-2">
            Then select <strong>Specific types of information</strong> as shown
            below
          </p>
          <Image src="/step1.7.PNG" alt="step" width={300} height={300} />
          <p className="pt-2">
            Select <strong>Messages</strong> and click <strong>next</strong>
          </p>
          <Image src="/step1.8.PNG" alt="step" width={300} height={300} />
          <p className="pt-2">
            Press <strong>Next</strong>, selecting{" "}
            <strong>Download to device</strong> by default
          </p>
          <p className="pt-3">
            On this popup, make sure to change Date range to{" "}
            <strong>All time</strong> and Format to <strong>JSON</strong>
          </p>
          <Image src="/step1.9.PNG" alt="step" width={300} height={300} />
          <p className="pt-4">
            Click <strong>Create files</strong> and wait approximately 1 day for
            the files to be ready to download
          </p>
        </div>
        <div className="pt-4 flex flex-col items-center">
          <h2 className="text-2xl font-semibold border-b border-slate-300 w-fit">
            Step 2
          </h2>
          <p>
            When your files are ready to download there should be multiple files
            available to download. For me, the file containing the messages was{" "}
            <strong>3/5</strong>, but it may vary.
          </p>
          <p className="pt-3">
            Open the zip folder, it should be named something like :
            facebook-your-name19375
          </p>
          <p className="pt-2">Follow this order</p>
          <div className="flex flex-row">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
            <p className="font-semibold pl-1">your_facebook_activity</p>
          </div>
          <div className="flex flex-row pl-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
            <p className="font-semibold pl-1">messages</p>
          </div>
          <div className="flex flex-row pl-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
            <p className="font-semibold pl-1">inbox</p>
          </div>
          <p>
            Find the folder with the name of the conversation you want to see
            the stats of, <strong>unzip it</strong> and put it on your desktop
          </p>
          <p className="py-3">
            Then, click choose files at the top of this page and select that
            folder - and there you go!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
