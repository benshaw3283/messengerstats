import React from "react";

const Test = () => {
  return (
    <div>
      <form
        action="http://localhost:3001/upload"
        method="post"
        encType="multipart/form-data"
      >
        <input type="file" name="zipFile" accept=".zip" />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Test;
