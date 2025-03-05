import React, { useState } from "react";
import { getContentType, writeBlobBodyParameter } from "./HttpFormBuilder";

const FileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Select a file first.");
      return;
    }

    const apiUrl = "https://your-instance.salesforce.com/messaging/v1/sessions/sendFile";
    const accessToken = "YOUR_ACCESS_TOKEN"; // Replace with actual Salesforce token

    try {
      const fileContent = await writeBlobBodyParameter("file", file, file.name);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": getContentType(),
        },
        body: fileContent,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed. Check console for details.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile} disabled={!file}>Upload to Salesforce</button>
    </div>
  );
};

export default FileUpload;
