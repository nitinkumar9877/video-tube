"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdClose, MdGridView, MdSearch, MdThumbUp, MdViewList } from "react-icons/md";
import styles from "@/components/styleSheets/liked.module.css";
import { getMyLikedVideos, removeLike } from "@/services/videos";
import { checkAlreadyLogin } from "@/services/AuthUser";

const getChannelName = (channel) => {
    if (!channel || typeof channel !== "object") return "Channel";
    return channel.channelName || channel.name || "Channel";
};

const formatCount = (count = 0) => {
    const value = Number(count) || 0;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return String(value);
};

const formatDuration = (duration = 0) => {
    const totalSeconds = Number(duration);
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return hours
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        : `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const formatPublishedDate = (date) => {
    if (!date) return "Recently uploaded";
    const publishedAt = new Date(date);
    return Number.isNaN(publishedAt.getTime())
        ? "Recently uploaded"
        : publishedAt.toLocaleDateString();
};

export default function LikesPage() {
    const router = useRouter();
    const [likedVideos, setLikedVideos] = useState([]);
    const [query, setQuery] = useState("");
    const [view, setView] = useState("grid");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingVideoId, setRemovingVideoId] = useState("");

    const filteredVideos = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return likedVideos;

        return likedVideos.filter((video) =>
            `${video.title || ""} ${getChannelName(video.channel)}`.toLowerCase().includes(normalizedQuery)
        );
    }, [likedVideos, query]);

    const removeLikedVideo = async (videoId) => {
        if (!videoId || removingVideoId) return;
        setRemovingVideoId(String(videoId));

        try {
            const response = await removeLike(videoId);
            if (!response?.success) {
                throw new Error(response?.message || "Failed to remove liked video.");
            }

            setLikedVideos((current) => current.filter(
                (video) => String(video._id || video.id) !== String(videoId)
            ));
            setError("");
        } catch (removeError) {
            setError(removeError?.message || "Failed to remove liked video.");
        } finally {
            setRemovingVideoId("");
        }
    };

    useEffect(() => {
        let isActive = true;

        const loadLikedVideos = async () => {
            try {
                const loginResponse = await checkAlreadyLogin();
                if (!loginResponse?.success) {
                    router.push("/login");
                    return;
                }

                const response = await getMyLikedVideos();
                if (!response?.success) {
                    throw new Error(response?.message || "Failed to fetch liked videos.");
                }
                if (isActive) {
                    setLikedVideos(Array.isArray(response.data) ? response.data : []);
                }
            } catch (loadError) {
                if (isActive) {
                    setError(loadError?.message || "Failed to fetch liked videos.");
                }
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadLikedVideos();
        return () => {
            isActive = false;
        };
    }, [router]);

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

                {error && <p role="alert">{error}</p>}

                {loading ? (
                    <div className={styles.emptyState}>Loading liked videos...</div>
                ) : filteredVideos.length > 0 ? (
                    <section
                        className={`${styles.videoCollection} ${view === "list" ? styles.listView : styles.gridView}`}
                        aria-label="Liked videos"
                    >
                        {filteredVideos.map((video) => {
                            const videoId = video._id || video.id;
                            const channelName = getChannelName(video.channel);
                            const title = video.title || "Untitled video";

                            return (
                            <article className={styles.videoCard} key={videoId}>
                                <Link
                                    href={`/dashboard/videos/${encodeURIComponent(String(videoId))}`}
                                    className={styles.thumbnail}
                                    aria-label={`Watch ${title}`}
                                >
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={video.thumbnailUrl}
                                            alt=""
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : <div className={styles.thumbnailPattern} />}
                                    <span className={styles.duration}>{formatDuration(video.duration)}</span>
                                </Link>

                                <div className={styles.cardBody}>
                                    <div className={styles.channelAvatar}>{channelName.charAt(0).toUpperCase()}</div>
                                    <div className={styles.videoDetails}>
                                        <Link href={`/dashboard/videos/${encodeURIComponent(String(videoId))}`} className={styles.videoTitle}>{title}</Link>
                                        <p>{channelName}</p>
                                        <p>{formatCount(video.views)} views · {formatPublishedDate(video.publishedAt || video.createdAt)}</p>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeLikedVideo(videoId)}
                                            disabled={Boolean(removingVideoId)}
                                            aria-label={`Remove ${title} from liked videos`}
                                        >
                                            <MdClose />
                                        </button>
                                    </div>
                                </div>
                            </article>
                            );
                        })}
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