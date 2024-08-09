import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const handleRequestDownload = async () => {
  try {
    const response = await fetch("/api/requestDownload", { method: "GET" });
    const result = await response.json();
    console.log(result.message);
  } catch (error) {
    console.error("Error running automation:", error);
  }
};

const Request = () => {
  return (
    <div>
      <Dialog>
        <DialogTrigger className="items-center justify-center shadow-inner shadow-blue-700  h-20 w-[300px] flex rounded-lg text-white font-Switzer font-semibold">
          Request Files
        </DialogTrigger>
        <DialogContent className=" bg-slate-950 rounded-lg border border-blue-700">
          <DialogHeader>
            <DialogTitle className="text-white font-Switzer pb-4">
              Request files download from Facebook?
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
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={handleRequestDownload}
            className="text-white shadow-inner shadow-blue-700 w-fit justify-self-center rounded-lg p-2 hover:text-white hover:scale-105 font-Switzer font-semibold"
          >
            Request Files
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Request;
