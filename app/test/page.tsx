"use client";
import React, { useState } from "react";

const Test = () => {
  const [status, setStatus] = useState("");

  const handleUpload = async (event: any) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.message); // Update the status with the server response
        // You can also handle the extracted files here if the server sends back their paths/names
      } else {
        setStatus("Upload failed.");
      }
    } catch (error: any) {
      setStatus("Error: " + error.message.toString());
    }
  };

  return (
    <div>
      <form onSubmit={handleUpload} encType="multipart/form-data">
        <input type="file" name="zipFile" accept=".zip" />
        <button type="submit">Upload</button>
      </form>
      <p>{status}</p> {/* Display status message */}
    </div>
  );
};

export default Test;
