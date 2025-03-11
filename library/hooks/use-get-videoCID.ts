import { pinata } from "@/services/pinata";
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
        const { data, contentType } = await pinata.gateways.public.get(
          videoCID
        );

        if (data instanceof Blob) {
          const url = URL.createObjectURL(data);
          setBlobURL(url);
          return { url, data, contentType };
        } else if (typeof data === "string" || data instanceof Object) {
          const blob = new Blob([JSON.stringify(data)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          setBlobURL(url);
          return { url, data, contentType };
        } else {
          return undefined;
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        throw error;
      }
    },
    []
  );

  return { getVideoCIDData };
};
