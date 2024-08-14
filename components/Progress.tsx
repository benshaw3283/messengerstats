import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const ProgressBar = () => {
  const [progress, setProgress] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [fakeProgress, setFakeProgress] = useState<boolean>(true);

  useEffect(() => {
    if (completed) return;

    // Fake progress phase

    const fakeProgressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 5) {
          return prev + 1;
        } else {
          clearInterval(fakeProgressInterval);
          setFakeProgress(false); // Stop fake progress and start real progress
          return prev;
        }
      });
    }, 1000);

    const eventSource = new EventSource("http://localhost:3001/progress");

    eventSource.onmessage = (event) => {
      if (fakeProgress) return;
      console.log("Received event:", event.data); // Check the received event data
      try {
        const data = JSON.parse(event.data);
        console.log("Parsed data:", data);
        console.log("data", data);
        setProgress(data.progress); // Update progress state
        console.log("Progress state updated to:", data.progress);
        if (data.progress >= 100) {
          setCompleted(true); // Mark as completed when progress reaches 100%
          eventSource.close(); // Close EventSource when done
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
    <div >
      <Progress value={progress} />
      <p>{progress}%</p>
    </div>
  );
};

export default ProgressBar;
