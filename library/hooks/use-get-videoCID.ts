import { useCallback, useEffect, useState } from "react";

interface SignedUrlResponse {
  url: string;
  data: JSON | string | Blob;
  contentType: string | null;
}

export const useGetVideoCID = () => {
  const [blobURL, setBlobURL] = useState<string>("");

  useEffect(() => {
    return () => {
      if (blobURL) {
        URL.revokeObjectURL(blobURL);
      }
    };
  }, [blobURL]);
  
  const getVideoCIDData = useCallback(
    async (videoCID: string): Promise<SignedUrlResponse | undefined> => {
      try {
        // const url = `https://ipfs.io/ipfs/${videoCID}#x-ipfs-companion-no-redirect`;
        const url = `https://lime-hidden-rodent-657.mypinata.cloud/ipfs/${videoCID}?pinataGatewayToken=8jiuhbdADzKIP0YFFfTybOIUUXvRMq0E7nHuzlm8qDo0Ri6euvHa7xiPVDvbODVf`
        const response = await fetch(url);
        const data = await response.blob();
        const contentType = response.headers.get("content-type");

        return { url, data, contentType };
      } catch (error) {
        console.error("Error fetching video:", error);
        throw error;
      }
    },
    []
  );

  return { getVideoCIDData };
};
