import { useCallback, useState } from "react";

import { pinata } from "@/services/pinata";

const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoCid, setVideoCid] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const uploadFile = useCallback(
    async ({
      file2,
    }: {
      file2?: File;
    } = {}): Promise<string | void> => {
      const _file = file2 || file;
      if (!_file) {
        return;
      }

      try {
        setUploading(true);
        const { cid } = await pinata.upload.public
          .file(_file)
          .key((await fetch("/api/key").then((res) => res.json())).JWT);
        setVideoCid(cid);
        return cid;
      } catch (e) {
        console.error("Error uploading file:", e);
        throw new Error("Trouble uploading file");
      } finally {
        setUploading(false);
      }
    },
    [file]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  }, []);

  return {
    file,
    setFile,
    videoCid,
    setVideoCid,
    uploading,
    uploadFile,
    handleChange,
  };
};

export default useFileUpload;
