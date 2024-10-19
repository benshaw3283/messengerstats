import React from "react";

const PrivacyInfo = () => {
  return (
    <div className="h-screen w-screen bg-slate-950 ">
      <a
        href="/"
        className="absolute left-0 top-0 p-2 cursor-pointer hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
          />
        </svg>
      </a>
      <h1 className="font-Switzer text-5xl font-semibold text-slate-600 flex justify-center py-4">
        Privacy & Info
      </h1>
      <div className="px-4 flex flex-col">
        <div className="flex flex-col">
          <h2 className=" text-slate-600 underline text-2xl font-Switzer pb-4">
            Privacy Statement
          </h2>
          <p className="text-slate-300">
            This website does not store or have access to any uploaded files.
          </p>
          <p className="text-slate-300 pt-2">
            File uploads, chunking and reading are handled completely
            client-side. There is no database or external server connected to
            this application, so when you reload the page any statistics
            gathered from uploaded files dissapear.{" "}
          </p>
          <p className="text-slate-300 pt-2">
            The automated requesting of files opens a browser window where you
            are prompted to sign in to Facebook to begin the process. This is an
            official Facebook sign in which can be validated through the URL.
          </p>
        </div>
        <div className="flex flex-col">
          <h2 className=" text-slate-600 underline text-2xl font-Switzer pb-4 pt-10">
            Info
          </h2>

          <p className="text-slate-300">
            This is a Next.js application that uses Tailwindcss, Shadcn
            components and Framer Motion, among other libraries.
          </p>
          <p className="text-slate-300 pt-2">{`When the files and conversation name are submitted, the folder with that name is found and a File reader accesses the files' data. All messages are spread into an array and sorted/filtered/mapped using functions to display each participants' data in lists. The most reacted media files are displayed inside carousels, showing 3 accessible files per media type. `}</p>
          <p className="text-slate-300 pt-2">
            The automated requesting of files to download from Facebook is done
            using a Puppeteer script that identifies and clicks the buttons
            through their Xpath. It ensures that the output is JSON and that the
            date range is all-time before closing the browser automatically.
          </p>
          <p className="text-slate-300 pt-10">
            Made by{" "}
            <a
              href="https://bshaw.me"
              className="font-semibold hover:text-white"
            >
              Ben Shaw
            </a>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyInfo;
