"use client";

import Image from "next/image";
import Link from "next/link";
import { MdMoreVert } from "react-icons/md";
import styles from "./page.module.css";
import logo from "@/assets/playTube.webp";
import { useEffect, useMemo, useState } from "react";
import { getAllVideos } from "@/services/videos";

const categories = ["All", 'Education', 'Entertainment', 'Music', 'Sports', 'News', 'Gaming', 'Lifestyle', 'Other'];

const formatDuration = (duration) => {
  const seconds = Number(duration);
  if (!Number.isFinite(seconds) || seconds <= 0) return "";

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const formatVideoMeta = (video) => {
  const viewCount = Number(video.views);
  const views = new Intl.NumberFormat("en", { notation: "compact" }).format(
    Number.isFinite(viewCount) ? viewCount : 0
  );
  const publishedAt = video.publishedAt || video.createdAt;
  if (!publishedAt) return `${views} views`;

  const publishedDate = new Date(publishedAt);
  if (Number.isNaN(publishedDate.getTime())) return `${views} views`;

  const elapsedDays = Math.max(0, Math.floor((Date.now() - publishedDate.getTime()) / 86400000));
  const age = elapsedDays === 0
    ? "today"
    : elapsedDays < 7
      ? `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`
      : elapsedDays < 30
        ? `${Math.floor(elapsedDays / 7)} week${Math.floor(elapsedDays / 7) === 1 ? "" : "s"} ago`
        : `${Math.floor(elapsedDays / 30)} month${Math.floor(elapsedDays / 30) === 1 ? "" : "s"} ago`;

  return `${views} views • ${age}`;
};

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      try {
        const response = await getAllVideos();
        if (!response?.success || !Array.isArray(response.data)) {
          throw new Error(response?.message || "Unable to load videos.");
        }

        if (isMounted) {
          setVideos(response.data.filter((video) => video && (video._id || video.id)));
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        if (isMounted) {
          setVideos([]);
          setError(error.message || "Unable to load videos. Please try again later.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === "All") return videos;
    return videos.filter((video) => video.category === selectedCategory);
  }, [selectedCategory, videos]);

  return (
    <div className={styles.page}>
      <div className={styles.categoryBar} aria-label="Video categories">
        {categories.map((category) => (
          <button
            type="button"
            className={`${styles.category} ${selectedCategory === category ? styles.active : ""}`}
            key={category}
            onClick={() => setSelectedCategory(category)}
            aria-pressed={selectedCategory === category}
          >
            {category}
          </button>
        ))}
      </div>

      <section className={styles.videoGrid} aria-label="Recommended videos">
        {loading ? (
          <p role="status">Loading videos...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : filteredVideos.length === 0 ? (
          <p role="status">
            {videos.length === 0
              ? "No videos are available yet."
              : `No videos found in ${selectedCategory}.`}
          </p>
        ) : (
          filteredVideos.map((video) => {
            const videoId = video._id || video.id;
            const channelName =
              video.channel?.channelName ||
              video.channel?.name ||
              video.owner?.username ||
              "Unknown channel";
            const thumbnailUrl = video.thumbnailUrl;
            const duration = formatDuration(video.duration);

            return (
              <article className={styles.videoCard} key={videoId}>
                <Link href={`/dashboard/videos/${videoId}`} className={styles.thumbnailLink}>
                  <div
                    className={styles.thumbnail}
                    style={
                      thumbnailUrl
                        ? { backgroundImage: `url("${thumbnailUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                    role="img"
                    aria-label={`${video.title || "Video"} thumbnail`}
                  >
                    {!thumbnailUrl && (
                      <span className={styles.thumbnailMark}>
                        <Image src={logo} alt="" width={34} height={34} />
                      </span>
                    )}
                    {duration && <span className={styles.duration}>{duration}</span>}
                  </div>
                </Link>

                <div className={styles.videoDetails}>
                  <div className={styles.avatar} aria-hidden="true">
                    {channelName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.videoCopy}>
                    <h2>{video.title || "Untitled video"}</h2>
                    <p>{channelName}</p>
                    <p>{formatVideoMeta(video)}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.moreButton}
                    aria-label={`More options for ${video.title || "video"}`}
                  >
                    <MdMoreVert />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}