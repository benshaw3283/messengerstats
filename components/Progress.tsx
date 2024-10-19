import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  begun: boolean;
}

const ProgressBar: React.FC<Props> = ({ begun }) => {
  const [progress, setProgress] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [fakeProgress, setFakeProgress] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(begun);

  // Example: Automatically open the dialog when the component mounts
  React.useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (completed) return;

    const fakeProgressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) {
          return prev + 1;
        } else {
          clearInterval(fakeProgressInterval);
          setFakeProgress(false); // Stop fake progress and start real progress
          return prev;
        }
      });
    }, 3000);

    const eventSource = new EventSource("http://localhost:3001/progress");

    eventSource.onmessage = (event) => {
      if (fakeProgress) return;
      console.log("Received event:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("Parsed data:", data);
        console.log("data", data);
        setProgress(40 + data.progress * 0.6);
        console.log("Progress state updated to:", data.progress);
        if (data.progress >= 100) {
          setCompleted(true);
          eventSource.close();
        }
      } catch (error) {
        console.error("Failed to parse progress update:", error);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
    };

    return () => {
      eventSource.close(); // Close the connection when the component unmounts
    };
  }, [completed, fakeProgress]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-950 text-white">
        <DialogHeader className="flex justify-center">
          <DialogTitle className="font-Switzer text-xl font-bold tracking-wide text-blue-700">
            File extraction in progress{" "}
          </DialogTitle>
          <DialogDescription className="flex flex-row">
            Estimated time:{" "}
            <span className="font-semibold flex pl-1">30-60 seconds</span>
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-6" />
        <p
          className={`${
            progress > 50 ? "text-white" : "text-slate-600"
          } absolute self-center justify-self-center translate-y-9 font-bold text-lg`}
        >
          {progress}%
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressBar;
