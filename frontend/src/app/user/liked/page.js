"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MdClose, MdGridView, MdMoreVert, MdSearch, MdThumbUp, MdViewList, } from "react-icons/md";
import styles from "@/components/styleSheets/liked.module.css";

const demoVideos = [
    { id: 1, title: "A Calm Journey Through the Mountain Valley", channel: "Northbound", views: "1.2M views", age: "2 months ago", duration: "18:24", accent: "#2563eb", likes: "48K" },
    { id: 2, title: "Building a Modern Design System in React", channel: "Design with Code", views: "842K views", age: "3 weeks ago", duration: "24:08", accent: "#ef4444", likes: "31K" },
    { id: 3, title: "Morning in the Highlands", channel: "Wander Stories", views: "412K views", age: "1 month ago", duration: "12:41", accent: "#059669", likes: "22K" },
    { id: 4, title: "Three Simple Meals for Busy Weeknights", channel: "Kitchen Notes", views: "326K views", age: "5 days ago", duration: "16:52", accent: "#ea580c", likes: "18K" },
    { id: 5, title: "JavaScript Concepts Explained Visually", channel: "Code Explained", views: "680K views", age: "2 weeks ago", duration: "21:15", accent: "#0891b2", likes: "54K" },
    { id: 6, title: "The Most Beautiful Train Journeys", channel: "Outside the Map", views: "2.1M views", age: "1 month ago", duration: "32:06", accent: "#7c3aed", likes: "96K" },
];

export default function LikesPage() {
    const [likedVideos, setLikedVideos] = useState(demoVideos);
    const [query, setQuery] = useState("");
    const [view, setView] = useState("grid");

    const filteredVideos = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return likedVideos;

        return likedVideos.filter((video) =>
            `${video.title} ${video.channel}`.toLowerCase().includes(normalizedQuery)
        );
    }, [likedVideos, query]);

    const removeLikedVideo = (videoId) => {
        setLikedVideos((current) => current.filter((video) => video.id !== videoId));
    };

    useEffect(() => {

        const likeVideoApiResponse = async 
    },[]);

    return (
        <main className={styles.page}>
            <div className={styles.pageWrap}>
                <header className={styles.pageHeader}>
                    <div className={styles.titleGroup}>
                        <span className={styles.titleIcon}><MdThumbUp /></span>
                        <div>
                            <p className={styles.eyebrow}>Your collection</p>
                            <h1>Liked videos</h1>
                        </div>
                    </div>

                    <div className={styles.headerControls}>
                        <label className={styles.searchBox}>
                            <MdSearch />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search liked videos"
                                aria-label="Search liked videos"
                            />
                        </label>

                        <div className={styles.viewToggle} aria-label="View type">
                            <button
                                type="button"
                                className={view === "grid" ? styles.viewActive : ""}
                                onClick={() => setView("grid")}
                                aria-label="Grid view"
                                aria-pressed={view === "grid"}
                            >
                                <MdGridView />
                            </button>
                            <button
                                type="button"
                                className={view === "list" ? styles.viewActive : ""}
                                onClick={() => setView("list")}
                                aria-label="List view"
                                aria-pressed={view === "list"}
                            >
                                <MdViewList />
                            </button>
                        </div>
                    </div>
                </header>

                <div className={styles.summaryRow}>
                    <strong>{likedVideos.length} liked videos</strong>
                    {query && <span>{filteredVideos.length} matches</span>}
                </div>

                {filteredVideos.length > 0 ? (
                    <section
                        className={`${styles.videoCollection} ${view === "list" ? styles.listView : styles.gridView}`}
                        aria-label="Liked videos"
                    >
                        {filteredVideos.map((video) => (
                            <article className={styles.videoCard} key={video.id}>
                                <Link
                                    href="/"
                                    className={styles.thumbnail}
                                    style={{ "--thumbnail-accent": video.accent }}
                                    aria-label={`Watch ${video.title}`}
                                >
                                    <div className={styles.thumbnailPattern} />
                                    <span className={styles.duration}>{video.duration}</span>
                                </Link>

                                <div className={styles.cardBody}>
                                    <div className={styles.channelAvatar} style={{ "--avatar-accent": video.accent }}>
                                        {video.channel.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.videoDetails}>
                                        <Link href="/" className={styles.videoTitle}>{video.title}</Link>
                                        <p>{video.channel}</p>
                                        <p>{video.views} · {video.age}</p>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button type="button" className={styles.iconButton} aria-label="More options">
                                            <MdMoreVert />
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeLikedVideo(video.id)}
                                            aria-label={`Remove ${video.title} from liked videos`}
                                        >
                                            <MdClose />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                ) : (
                    <div className={styles.emptyState}>
                        <MdThumbUp />
                        <h2>{likedVideos.length === 0 ? "No liked videos yet" : "No matching liked videos"}</h2>
                        <p>{likedVideos.length === 0 ? "Videos you like will appear here." : "Try another title or channel name."}</p>
                    </div>
                )}
            </div>
        </main>
    );
}