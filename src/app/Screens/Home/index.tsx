"use client";

import Image from "next/image";
import ScreenLayout from "../layout";
import styles from "./index.module.scss";
import Button from "@/components/Button";
import useLocalStorage from "@/hooks/use-local-storage-state";
import { UserInfo } from "@/types";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { ErrorRes } from "@neynar/nodejs-sdk/build/api/models";
import { useApp } from "@/Context/AppContext";
import { useState } from "react";

const Home = () => {
  const [user] = useLocalStorage<UserInfo>("user");
  const { displayName, pfp } = useApp();
  const [title, setTitle] = useState("");
  const [frameId, setFrameId] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const frameUrl = frameId
    ? `${window.location.origin}/frames?id=${frameId}`
    : null;

  async function handlePublishCast() {
    if (!frameUrl) return;

    const { signerUuid } = user;
    setIsPosting(true);

    try {
      // Add 2 second delay to allow frame metadata to be fetched
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const {
        data: { message },
      } = await axios.post<{ message: string }>("/api/cast", {
        signerUuid,
        text: frameUrl,
      });
      toast(message, {
        type: "success",
        theme: "dark",
        autoClose: 3000,
        position: "bottom-right",
        pauseOnHover: true,
      });
    } catch (err) {
      const { message } = (err as AxiosError).response?.data as ErrorRes;
      toast(message, {
        type: "error",
        theme: "dark",
        autoClose: 3000,
        position: "bottom-right",
        pauseOnHover: true,
      });
    } finally {
      setIsPosting(false);
    }
  }

  const handleViewFrame = () => {
    if (!frameUrl) return;
    window.open(
      `https://warpcast.com/~/developers/frames?url=${encodeURIComponent(
        frameUrl
      )}`,
      "_blank"
    );
  };

  const handleSaveTitle = async () => {
    if (title.length > 20) {
      toast("Title must be 20 characters or less", {
        type: "error",
        theme: "dark",
        autoClose: 3000,
        position: "bottom-right",
      });
      return;
    }

    try {
      const { data } = await axios.post<{ frameId: string }>("/api/frames", {
        title,
      });
      setFrameId(data.frameId);
    } catch (err) {
      toast("Failed to create frame", {
        type: "error",
        theme: "dark",
        autoClose: 3000,
        position: "bottom-right",
      });
    }
  };

  const handlePostToWarpcast = () => {
    if (!frameUrl) return;
    window.open(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(frameUrl)}`,
      "_blank"
    );
  };

  return (
    <ScreenLayout>
      <main className="flex flex-col flex-grow justify-center items-center">
        {displayName && pfp ? (
          <>
            <p className="text-3xl">
              Hello{" "}
              {displayName && (
                <span className="font-medium">{displayName}</span>
              )}
            </p>
            <div className={styles.inputContainer}>
              <Image
                src={pfp}
                width={40}
                height={40}
                alt="User Profile Picture"
                className={`${styles.profilePic} rounded-full`}
              />
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.userInput}
                placeholder="Enter frame title (max 20 chars)"
                rows={2}
                maxLength={20}
                disabled={!!frameId}
              />
            </div>
            <div className="flex gap-4">
              {!frameId ? (
                <Button onClick={handleSaveTitle} title="Save Title" />
              ) : (
                <>
                  <Button onClick={handleViewFrame} title="View Frame" />
                  <Button
                    onClick={handlePostToWarpcast}
                    title="Post to Warpcast"
                  />
                  <Button
                    onClick={handlePublishCast}
                    title={isPosting ? "Posting..." : "Cast Frame"}
                    disabled={isPosting}
                  />
                </>
              )}
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </ScreenLayout>
  );
};

export default Home;
