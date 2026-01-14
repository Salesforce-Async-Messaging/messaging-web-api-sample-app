const BOUNDARY = "1ff13444ed8140c7a32fc4e6451aa76d";

const getContentType = () => {
  return `multipart/form-data; charset="UTF-8"; boundary="${BOUNDARY}"`;
};

const writeBoundary = (ending = "None") => {
  let value = "";

  if (ending === "Cr") {
    value += "\n";
  } else if (ending === "None") {
    value += "\r\n";
  }

  value += `--${BOUNDARY}--\r\n`;
  return btoa(value); // Base64 encode
};

const writeBodyParameter = (key, value) => {
  let contentDisposition = `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
  let content = btoa(contentDisposition) + btoa(value + "\r\n");

  return content;
};

const resolveMimeType = (fileName) => {
  const fileType = fileName.split(".").pop().toLowerCase();
  const mimeTypes = {
    png: "image/png",
    jpg: "image/jpg",
    jpeg: "image/jpg",
    pgm: "image/x-portable-graymap",
    ppm: "image/x-portable-pixmap",
  };
  return mimeTypes[fileType] || "image/png";
};

const writeBlobBodyParameter = (key, file, fileName) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      let file64 = btoa(reader.result); // Convert to base64
      const mimeType = resolveMimeType(fileName);

      let contentDisposition = `Content-Disposition: form-data; name="${key}"; filename="${fileName}"\r\n`;
      let contentTypeHeader = `Content-Type: ${mimeType}\r\n\r\n`;

      let last4Bytes = file64.slice(-4);
      let ending = "None";

      if (last4Bytes.endsWith("==")) {
        file64 = file64.slice(0, -4) + "0K";
        ending = "CrLf";
      } else if (last4Bytes.endsWith("=")) {
        file64 = file64.slice(0, -4) + "N";
        ending = "Cr";
      }

      let content =
        btoa(contentDisposition) +
        btoa(contentTypeHeader) +
        file64 +
        writeBoundary(ending);

      resolve(content);
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(file);
  });
};

export { getContentType, writeBodyParameter, writeBlobBodyParameter };
