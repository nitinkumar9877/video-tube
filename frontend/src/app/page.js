"use client";

import Image from "next/image";
import Link from "next/link";
import { MdMoreVert } from "react-icons/md";
import styles from "./page.module.css";
import logo from "@/assets/playTube.webp";
import { useMemo, useState } from "react";

const categories = ["All", 'Education', 'Entertainment', 'Music', 'Sports', 'News', 'Gaming', 'Lifestyle', 'Other'];
// let videos = [];
const videos = [
  {
    id: 1,
    title: "Building a modern app with Next.js",
    channel: "Design with Code",
    meta: "1.2M views • 2 days ago",
    duration: "18:24",
    theme: "violet",
    category: "Education",
  },
  {
    id: 2,
    title: "A peaceful morning in the mountains",
    channel: "Wander Stories",
    meta: "842K views • 1 week ago",
    duration: "12:08",
    theme: "orange",
    category: "Lifestyle",
  },
  {
    id: 3,
    title: "Lo-fi beats for focus and study",
    channel: "Chill Station",
    meta: "5.7M views • 3 weeks ago",
    duration: "LIVE",
    theme: "blue",
    category: "Music",
  },
  {
    id: 4,
    title: "How I redesigned my entire workspace",
    channel: "Studio North",
    meta: "326K views • 5 days ago",
    duration: "21:41",
    theme: "green",
    category: "Lifestyle",
  },
  {
    id: 5,
    title: "The most beautiful train journeys",
    channel: "Outside the Map",
    meta: "2.1M views • 1 month ago",
    duration: "16:52",
    theme: "rose",
    category: "Lifestyle",
  },
  {
    id: 6,
    title: "JavaScript concepts explained visually",
    channel: "Code Explained",
    meta: "680K views • 4 days ago",
    duration: "24:15",
    theme: "cyan",
    category: "Education",
  },
  {
    id: 7,
    title: "Easy dinner ideas for busy weeknights",
    channel: "Kitchen Notes",
    meta: "914K views • 6 days ago",
    duration: "14:33",
    theme: "yellow",
    category: "Lifestyle",
  },
  {
    id: 8,
    title: "Live performance from the rooftop",
    channel: "The Independent",
    meta: "48K watching",
    duration: "LIVE",
    theme: "red",
    category: "Entertainment",
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredVideos = useMemo(() => {
    if (selectedCategory === "All") return videos;
    return videos.filter((video) => video.category === selectedCategory);
  }, [selectedCategory]);

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
        {filteredVideos.map((video) => (
          <article className={styles.videoCard} key={video.id}>
            <Link href={`/dashboard/videos/${video.id}`} className={styles.thumbnailLink}>
              <div className={`${styles.thumbnail} ${styles[video.theme]}`}>
                <span className={styles.thumbnailMark}>
                  <Image src={logo} alt="" width={34} height={34} />
                </span>
                <span className={styles.duration}>{video.duration}</span>
              </div>
            </Link>

            <div className={styles.videoDetails}>
              <div className={styles.avatar} aria-hidden="true">
                {video.channel.charAt(0)}
              </div>
              <div className={styles.videoCopy}>
                <h2>{video.title}</h2>
                <p>{video.channel}</p>
                <p>{video.meta}</p>
              </div>
              <button type="button" className={styles.moreButton} aria-label="More options">
                <MdMoreVert />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}