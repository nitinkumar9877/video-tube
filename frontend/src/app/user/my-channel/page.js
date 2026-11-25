"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdAdd, MdAnalytics, MdCheckCircle, MdEdit, MdGridView, MdMoreVert, MdNotificationsNone, MdOutlineVideoLibrary, MdSearch, MdVideoCameraBack, MdViewList, MdVisibility, } from "react-icons/md";
import styles from "@/components/styleSheets/my-channel.module.css";
import { checkAlreadyLogin } from "@/services/AuthUser";
import { getMyChannel } from "@/services/channel.services";
import { getMyVideos } from "@/services/videos";

const formatCount = (value) => new Intl.NumberFormat().format(Number(value) || 0);

const formatDuration = (value) => {
    const seconds = Math.max(0, Number(value) || 0);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const paddedSeconds = String(remainingSeconds).padStart(2, "0");

    return hours
        ? `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`
        : `${minutes}:${paddedSeconds}`;
};

const formatDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString()
        : "Date unavailable";
};

const tabs = ["Home", "Videos"];

export default function MyChannelPage() {
    const router = useRouter();
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState([]);
    const [loadError, setLoadError] = useState("");
    const [activeTab, setActiveTab] = useState("Videos");
    const [query, setQuery] = useState("");
    const [view, setView] = useState("grid");

    useEffect(() => {
        let isMounted = true;
        const checkAuthAndFetchChannelDetails = async () => {
            try {
                // Step 1: Check authentication
                console.log("-------------------------------1--------------------------------");
                const response = await checkAlreadyLogin();
                if (!response?.success) {
                    router.replace("/login");
                    return;
                }
                console.log("-------------------------------2--------------------------------");

                // Step 2: Fetch channel
                const channelResponse = await getMyChannel();
                if (!channelResponse?.success) {
                    console.error(
                        "Failed to fetch channel data:",
                        channelResponse?.message
                    );
                    if (isMounted) {
                        setChannel(null);
                        setLoadError(channelResponse?.message || "Unable to load your channel.");
                    }
                    return;
                }
                if (!channelResponse?.channel) {
                    if (isMounted) {
                        setChannel(null);
                    }
                    return;
                }
                if (isMounted) {
                    setChannel(channelResponse.channel);
                }
                console.log("channelResponse:", channel);
                console.log("-------------------------------3--------------------------------");

                // Step 3: Fetch videos
                const videoResponse = await getMyVideos();
                if (!videoResponse?.success) {
                    if (isMounted) {
                        setVideos([]);
                        setLoadError(videoResponse?.message || "Unable to load your videos.");
                    }
                    return;
                }
                if (isMounted) {
                    setVideos(videoResponse.videos);
                }
                console.log("videoResponse:", videos);
                console.log("-------------------------------4--------------------------------");

            } catch (error) {
                console.error("Error checking authentication:", error);

                if (isMounted) {
                    if (error.response?.status === 401) {
                        router.replace("/login");
                    } else {
                        setLoadError("Unable to load your channel right now.");
                    }
                }

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        checkAuthAndFetchChannelDetails();
        return () => {
            isMounted = false;
        };
    }, [router]);

    const channelName = channel?.channelName || "Your channel";
    const channelHandle = channel?.channelHandle || "";
    const initials = useMemo(() => channelName
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(""),
        [channelName]
    );

    const filteredVideos = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return videos;
        return videos.filter((item) => item.title?.toLowerCase().includes(normalizedQuery));
    }, [query, videos]);

    const totalViews = videos.reduce((total, item) => total + (Number(item.views) || 0), 0);
    const subscriberCount = Number(channel?.subscribersCount) || 0;

    if (!loading && !channel) {
        return (
            <main className="w-full min-h-full bg-white">
                <div className={styles.page}>
                    <section className={styles.emptyState}>
                        <MdVideoCameraBack />
                        <h1>Create your channel</h1>
                        <p>Your channel dashboard will appear here after setup.</p>
                        <Link href="/user/createChannel" className={styles.uploadButton}>Create channel</Link>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full min-h-full bg-white">
            <div className={styles.page}>
                <header className={styles.pageHeader}>
                    <div>
                        <p className={styles.eyebrow}>Creator studio</p>
                        <h1>Channel dashboard</h1>
                    </div>
                    <Link href="/user/my-channel/upload" className={styles.uploadButton}>
                        <MdVideoCameraBack />
                        Upload video
                    </Link>
                </header>

                <section className={styles.channelCard}>
                    <div className={styles.banner}>
                        <div className={styles.bannerPattern} />
                        {/* <button type="button" className={styles.editBanner} aria-label="Edit channel banner">
                            <MdEdit />
                        </button> */}
                    </div>

                    <div className={styles.identityRow}>
                        <div className={styles.avatarWrap}>
                            {channel?.channelLogo ? (
                                <Image
                                    src={channel.channelLogo}
                                    alt={channelName}
                                    width={112}
                                    height={112}
                                    className={styles.avatar}
                                />
                            ) : (
                                <div className={styles.avatar}>{initials}</div>
                            )}
                            <span className={styles.onlineDot} />
                        </div>

                        <div className={styles.identity}>
                            <div className={styles.nameRow}>
                                <h2>{channelName}</h2>
                                <MdCheckCircle className={styles.verified} aria-label="Verified" />
                            </div>
                            <p>@{channelHandle || "channel"} · {formatCount(subscriberCount)} subscribers · {formatCount(videos.length)} videos</p>
                        </div>

                    </div>

                    <nav className={styles.tabs} aria-label="My channel sections">
                        {tabs.map((tab) => (
                            <button
                                type="button"
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </section>

                <section className={styles.dashboardGrid}>
                    <div className={styles.mainColumn}>
                        <section className={styles.analyticsCard}>
                            <div className={styles.cardHeading}>
                                <div>
                                    <p className={styles.eyebrow}>Analytics</p>
                                    <h2>Channel performance</h2>
                                </div>
                                {/* <Link href="/dashboard/videos" className={styles.analyticsLink}>
                                    <MdAnalytics />
                                    View analytics
                                </Link> */}
                            </div>

                            <div className={styles.metricsGrid}>
                                <div className={styles.metric}>
                                    <span className={styles.metricIcon}><MdVisibility /></span>
                                    <div><strong>{formatCount(totalViews)}</strong><small>Views across your videos</small></div>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricIcon}><MdOutlineVideoLibrary /></span>
                                    <div><strong>{formatCount(videos.length)}</strong><small>{videos.length === 1 ? "Video" : "Videos"}</small></div>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricIcon}><MdCheckCircle /></span>
                                    <div><strong>{formatCount(subscriberCount)}</strong><small>{subscriberCount === 1 ? "Subscriber" : "Subscribers"}</small></div>
                                </div>
                            </div>

                            <div className={`${styles.chart} ${styles.chartEmpty}`} role="status">
                                {totalViews === 0
                                    ? "Your videos have not received views yet. Views will appear here as people watch."
                                    : "Daily view history is not available yet."}
                            </div>
                        </section>

                        <section className={styles.videosCard}>
                            <div className={styles.videosHeader}>
                                <div>
                                    <p className={styles.eyebrow}>Content</p>
                                    <h2>Channel videos</h2>
                                </div>
                                <div className={styles.videoControls}>
                                    <label className={styles.searchBox}>
                                        <MdSearch />
                                        <input
                                            type="search"
                                            value={query}
                                            onChange={(event) => setQuery(event.target.value)}
                                            placeholder="Search videos"
                                            aria-label="Search channel videos"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className={`${styles.viewControl} ${view === "grid" ? styles.viewActive : ""}`}
                                        onClick={() => setView("grid")}
                                        aria-label="Grid view"
                                    >
                                        <MdGridView />
                                    </button>
                                    {/* <button
                                        type="button"
                                        className={`${styles.viewControl} ${view === "list" ? styles.viewActive : ""}`}
                                        onClick={() => setView("list")}
                                        aria-label="List view"
                                    >
                                        <MdViewList />
                                    </button> */}
                                </div>
                            </div>

                            {loading ? (
                                <div className={styles.emptyState}>Loading channel videos...</div>
                            ) : loadError ? (
                                <div className={styles.emptyState} role="alert">
                                    <h3>Could not load channel data</h3>
                                    <p>{loadError}</p>
                                </div>
                            ) : videos.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdOutlineVideoLibrary />
                                    <h3>No videos yet</h3>
                                    <p>Your video list and view counts will appear here after you upload a video.</p>
                                    <Link href="/user/my-channel/upload" className={styles.uploadButton}>Upload video</Link>
                                </div>
                            ) : filteredVideos.length ? (
                                <div className={`${styles.videoCollection} ${view === "list" ? styles.listView : styles.gridView}`}>
                                    {filteredVideos.map((item) => (
                                        <article className={styles.videoCard} key={item._id}>
                                            <div
                                                className={styles.thumbnail}
                                                style={item.thumbnailUrl ? {
                                                    backgroundImage: `linear-gradient(rgba(15, 15, 15, 0.05), rgba(15, 15, 15, 0.4)), url("${item.thumbnailUrl}")`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                } : undefined}
                                            >
                                                <div className={styles.thumbnailPattern} />
                                                <button type="button"  onClick={() => router.push(`/dashboard/videos/${item._id}/edit`)} className={styles.thumbnailEdit} aria-label={`Edit ${item.title}`}>
                                                    <MdEdit />
                                                </button>
                                                <span className={styles.duration}>{formatDuration(item.duration)}</span>
                                            </div>
                                            <div className={styles.videoDetails}>
                                                <div>
                                                    <h3>{item.title}</h3>
                                                    <p>{formatCount(item.views)} views · {formatDate(item.createdAt)}</p>
                                                </div>
                                                <button type="button" className={styles.videoMenu} aria-label="Video options">
                                                    <MdMoreVert />
                                                </button>
                                                <div className={styles.videoStats}>
                                                    <span><MdVisibility /> {formatCount(item.views)} views</span>
                                                    <span><MdCheckCircle /> {formatCount(Array.isArray(item.likes) ? item.likes.length : item.likes)} likes</span>
                                                    <span><MdOutlineVideoLibrary /> {formatCount(Array.isArray(item.comments) ? item.comments.length : item.comments)} comments</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <MdOutlineVideoLibrary />
                                    <h3>No videos found</h3>
                                    <p>Try a different search term.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className={styles.sideColumn}>
                        <section className={styles.sideCard}>
                            <div className={styles.cardHeading}>
                                <div>
                                    <p className={styles.eyebrow}>Quick actions</p>
                                    <h2>Manage channel</h2>
                                </div>
                            </div>
                            <Link href="/user/my-channel/upload" className={styles.actionRow}>
                                <span><MdAdd /></span>
                                <div><strong>Upload a video</strong><small>Share new content</small></div>
                            </Link>
                            {/* <Link href="/dashboard/videos" className={styles.actionRow}>
                                <span><MdOutlineVideoLibrary /></span>
                                <div><strong>Manage videos</strong><small>Organize your uploads</small></div>
                            </Link> */}
                        </section>
                    </aside>
                </section>
            </div>
        </main>
    );
}