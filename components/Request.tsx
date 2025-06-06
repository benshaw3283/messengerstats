import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const handleRequestDownload = async () => {
  const noVNCUrl = "https://api.messengerstats.com/vnc.html?path=websockify/&encrypt=true&autoconnect=true";

  // Redirect to the VNC URL first
  window.open(noVNCUrl, "_blank");

  // Delay before starting Puppeteer
  setTimeout(async () => {
    try {
      const response = await fetch(`https://api.messengerstats.com/start`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Puppeteer automation started");
      } else {
        console.error("Failed to start Puppeteer automation");
      }
    } catch (error) {
      console.error("Error starting Puppeteer automation:", error);
    }
  }, 500);
};

const Request = () => {
  return (
    <div>
      <Dialog>
        <DialogTrigger className="items-center justify-center bg-slate-200 text-xl hover:bg-blue-700 hover:text-white text-blue-700  h-14 w-[200px] flex rounded-lg  font-Switzer font-semibold">
          Request Files
        </DialogTrigger>
        <DialogContent className=" bg-slate-950 rounded-lg border border-blue-700">
          <DialogHeader>
            <DialogTitle className="text-white font-Switzer pb-4 tracking-wide text-2xl">
              Request files from Facebook?
            </DialogTitle>
            <DialogDescription>
              <p>
                Log in to Facebook once the browser opens to begin the automated
                process.
              </p>

              <p>
                If you would like to request these files manually, see the
                <a
                  href="/tutorial"
                  className="font-semibold pl-1 underline hover:text-white text-blue-700 cursor-pointer"
                >
                  Tutorial
                </a>
              </p>
              <div className="flex flex-row justify-center pt-4 gap-2 items-center">
                <p className="text-blue-700 text-xl ">!</p>
                <p className="text-white text-xs flex justify-center pt-1 ">
                  Works on phones using the side panel
                </p>
                <p className="text-blue-700 text-xl ">!</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={handleRequestDownload}
            className="bg-slate-200 text-xl hover:bg-blue-700 hover:text-white text-blue-700 w-fit justify-self-center rounded-lg p-2 font-semibold font-Switzer tracking-wide"
          >
            Request Files
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Request;
