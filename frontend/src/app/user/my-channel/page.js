"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdAdd, MdAnalytics, MdBarChart, MdCheckCircle, MdEdit, MdGridView, MdMoreVert, MdNotificationsNone, MdOutlineVideoLibrary, MdSearch, MdVideoCameraBack, MdViewList, MdVisibility, } from "react-icons/md";
import api from "@/services/api";
import styles from "@/components/styleSheets/my-channel.module.css";
import { checkAlreadyLogin } from "@/services/AuthUser";
import { getMyChannel } from "@/services/channel.services";

const demoVideos = [
    { id: 1, title: "Building a modern dashboard from scratch", views: "48K", age: "2 days ago", duration: "12:48", comments: 184, likes: "3.8K", accent: "#315b9b" },
    { id: 2, title: "The desk setup that changed my workflow", views: "125K", age: "1 week ago", duration: "8:21", comments: 326, likes: "8.1K", accent: "#7c3aed" },
    { id: 3, title: "Designing faster with useful components", views: "91K", age: "2 weeks ago", duration: "16:04", comments: 245, likes: "6.4K", accent: "#0f766e" },
    { id: 4, title: "A productive day as a software engineer", views: "63K", age: "3 weeks ago", duration: "10:32", comments: 198, likes: "5.2K", accent: "#c2410c" },
];

const tabs = ["Home", "Videos", "Shorts", "Live", "Playlists", "Posts"];

export default function MyChannelPage() {
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Videos");
    const [query, setQuery] = useState("");
    const [view, setView] = useState("grid");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await checkAlreadyLogin();
                if (!response?.success) {
                    window.location.href = "/login";
                }
            } catch (error) {
                console.error("Error checking authentication:", error);
                window.location.href = "/login";
            }
        };
        const fetchChannelData = async () => {
            try {
                const response = await getMyChannel();
                setChannel(response);
                console.log("Fetched channel data:", response);
            } catch (error) {
                console.error("Error fetching channel data:", error);
                window.location.href = "/login";
            }
            finally {
                setLoading(false);
            }
        }
        checkAuth();
        fetchChannelData();

    }, []);

    const channelName = channel?.channelName || "Nitin Kumar";
    const channelHandle = channel?.channelHandle || "nitinkumar";
    const initials = useMemo(
        () =>
            channelName
                .split(/[\s._-]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("") || "NK",
        [channelName]
    );

    const filteredVideos = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return demoVideos;
        return demoVideos.filter((video) => video.title.toLowerCase().includes(normalizedQuery));
    }, [query]);

    return (
        <main className="w-full min-h-full bg-white">
            <div className={styles.page}>
                <header className={styles.pageHeader}>
                    <div>
                        <p className={styles.eyebrow}>Creator studio</p>
                        <h1>Channel dashboard</h1>
                    </div>
                    <Link href="/dashboard/upload" className={styles.uploadButton}>
                        <MdVideoCameraBack />
                        Upload video
                    </Link>
                </header>

                <section className={styles.channelCard}>
                    <div className={styles.banner}>
                        <div className={styles.bannerPattern} />
                        <button type="button" className={styles.editBanner} aria-label="Edit channel banner">
                            <MdEdit />
                        </button>
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
                            <p>@{channelHandle} · {channel?.subscribersCount || 284000} subscribers · {channel?.totalVideos || 86} videos</p>
                        </div>

                        <div className={styles.channelActions}>
                            <button type="button" className={styles.iconButton} aria-label="Channel notifications">
                                <MdNotificationsNone />
                            </button>
                            <Link href="/dashboard/channel" className={styles.viewButton}>View channel</Link>
                            <Link href="/dashboard/createChannel" className={styles.manageButton}>
                                <MdEdit />
                                Customize
                            </Link>
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
                                <Link href="/dashboard/videos" className={styles.analyticsLink}>
                                    <MdAnalytics />
                                    View analytics
                                </Link>
                            </div>

                            <div className={styles.metricsGrid}>
                                <div className={styles.metric}>
                                    <span className={styles.metricIcon}><MdVisibility /></span>
                                    <div><strong>{channel?.totalViews ? `${channel.totalViews}` : "1.8M"}</strong><small>Views · 28 days</small></div>
                                    <b className={styles.positive}>+12.4%</b>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricIcon}><MdBarChart /></span>
                                    <div><strong>86.4K</strong><small>Watch time</small></div>
                                    <b className={styles.positive}>+8.7%</b>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricIcon}><MdCheckCircle /></span>
                                    <div><strong>+4.2K</strong><small>Subscribers</small></div>
                                    <b className={styles.positive}>+18.2%</b>
                                </div>
                            </div>

                            <div className={styles.chart} aria-label="Views chart for the last seven days">
                                {[42, 58, 49, 72, 64, 88, 76].map((height, index) => (
                                    <div className={styles.chartColumn} key={height + index}>
                                        <div className={styles.chartBar} style={{ height: `${height}%` }} />
                                        <span>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
                                    </div>
                                ))}
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
                                    <button
                                        type="button"
                                        className={`${styles.viewControl} ${view === "list" ? styles.viewActive : ""}`}
                                        onClick={() => setView("list")}
                                        aria-label="List view"
                                    >
                                        <MdViewList />
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className={styles.emptyState}>Loading channel videos...</div>
                            ) : filteredVideos.length ? (
                                <div className={`${styles.videoCollection} ${view === "list" ? styles.listView : styles.gridView}`}>
                                    {filteredVideos.map((video) => (
                                        <article className={styles.videoCard} key={video.id}>
                                            <div className={styles.thumbnail} style={{ "--thumbnail-accent": video.accent }}>
                                                <div className={styles.thumbnailPattern} />
                                                <button type="button" className={styles.thumbnailEdit} aria-label={`Edit ${video.title}`}>
                                                    <MdEdit />
                                                </button>
                                                <span className={styles.duration}>{video.duration}</span>
                                            </div>
                                            <div className={styles.videoDetails}>
                                                <div>
                                                    <h3>{video.title}</h3>
                                                    <p>{video.views} views · {video.age}</p>
                                                </div>
                                                <button type="button" className={styles.videoMenu} aria-label="Video options">
                                                    <MdMoreVert />
                                                </button>
                                                <div className={styles.videoStats}>
                                                    <span><MdVisibility /> {video.views}</span>
                                                    <span><MdCheckCircle /> {video.likes}</span>
                                                    <span><MdOutlineVideoLibrary /> {video.comments}</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <MdOutlineVideoLibrary />
                                    <h3>No videos found</h3>
                                    <p>Try another search or upload a new video.</p>
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
                            <Link href="/dashboard/upload" className={styles.actionRow}>
                                <span><MdAdd /></span>
                                <div><strong>Upload a video</strong><small>Share new content</small></div>
                            </Link>
                            <Link href="/dashboard/createChannel" className={styles.actionRow}>
                                <span><MdEdit /></span>
                                <div><strong>Edit channel</strong><small>Update profile details</small></div>
                            </Link>
                            <Link href="/dashboard/videos" className={styles.actionRow}>
                                <span><MdOutlineVideoLibrary /></span>
                                <div><strong>Manage videos</strong><small>Organize your uploads</small></div>
                            </Link>
                        </section>

                        <section className={styles.sideCard}>
                            <p className={styles.eyebrow}>Channel status</p>
                            <h2>{channel ? "Channel is live" : "Demo channel"}</h2>
                            <div className={styles.statusRow}>
                                <span className={styles.statusDot} />
                                <div><strong>Public</strong><small>Your channel is visible to everyone</small></div>
                            </div>
                            <div className={styles.statusRow}>
                                <span className={styles.statusDotMuted} />
                                <div><strong>Monetization</strong><small>Complete the requirements to apply</small></div>
                            </div>
                        </section>
                    </aside>
                </section>
            </div>
        </main>
    );
}