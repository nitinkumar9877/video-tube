"use client";

import { useState } from "react";
import { MdMoreVert, MdNotificationsNone, MdCheckCircle, MdPlayArrow, MdBarChart, MdEdit, MdVideoCall, MdShare, MdSearch, MdSort, MdGridView, } from "react-icons/md";
import styles from "@/components/styleSheets/channel.module.css";

const tabs = ["Home", "Videos", "Shorts", "Live", "Playlists", "Posts"];

const videos = [
    {
        id: 1,
        title: "Building a modern dashboard from scratch",
        meta: "48K views • 2 days ago",
        duration: "12:48",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 2,
        title: "The desk setup that changed my workflow",
        meta: "125K views • 1 week ago",
        duration: "8:21",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 3,
        title: "Designing faster with useful components",
        meta: "91K views • 2 weeks ago",
        duration: "16:04",
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 4,
        title: "A productive day as a software engineer",
        meta: "63K views • 3 weeks ago",
        duration: "10:32",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=85",
    },
];

export default function ChannelPage() {
    const [activeTab, setActiveTab] = useState("Home");
    const [subscribed, setSubscribed] = useState(false);

    return (
        <div className="w-full min-h-full bg-white">
            <div className={styles.page}>
                <section className={styles.banner} aria-label="Channel banner">
                    <div className={styles.bannerPattern} />
                </section>

                <header className={styles.channelHeader}>
                    <div className={styles.avatar} aria-label="Nitin Kumar profile">
                        NK
                        <span className={styles.avatarStatus} />
                    </div>

                    <div className={styles.channelInfo}>
                        <div className={styles.nameRow}>
                            <h1>Nitin Kumar</h1>
                            <MdCheckCircle className={styles.verified} aria-label="Verified" />
                        </div>
                        <p className={styles.handle}>@nitinkumar · 284K subscribers · 86 videos</p>
                        <p className={styles.description}>
                            Creative developer sharing practical tutorials, design tips, and honest
                            stories from the world of building for the web.
                            <button type="button" className={styles.moreText}>...more</button>
                        </p>
                        <a className={styles.channelLink} href="https://nitinkumar.dev" target="_blank" rel="noreferrer">
                            nitinkumar.dev
                        </a>
                    </div>

                    <div className={styles.headerActions}>
                        <button type="button" className={styles.iconButton} aria-label="Channel search">
                            <MdSearch />
                        </button>
                        <button
                            type="button"
                            className={`${styles.subscribeButton} ${subscribed ? styles.subscribed : ""}`}
                            onClick={() => setSubscribed((value) => !value)}
                        >
                            {subscribed ? <MdNotificationsNone /> : null}
                            {subscribed ? "Subscribed" : "Subscribe"}
                        </button>
                        <button type="button" className={styles.iconButton} aria-label="More channel actions">
                            <MdMoreVert />
                        </button>
                    </div>
                </header>

                <nav className={styles.tabs} aria-label="Channel sections">
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
                    <button type="button" className={styles.tabSearch} aria-label="Search channel">
                        <MdSearch />
                    </button>
                </nav>

                <main className={styles.content}>
                    <section className={styles.featured}>
                        <div className={styles.featuredVideo}>
                            <img
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85"
                                alt="Laptop with code on screen"
                            />
                            <span className={styles.duration}>14:25</span>
                            <button type="button" className={styles.playOverlay} aria-label="Play featured video">
                                <MdPlayArrow />
                            </button>
                        </div>
                        <div className={styles.featuredDetails}>
                            <span className={styles.featuredLabel}>Featured video</span>
                            <h2>My complete web development roadmap for 2026</h2>
                            <p className={styles.featuredMeta}>248K views • 4 days ago</p>
                            <p className={styles.featuredDescription}>
                                Everything I would learn again in 2026, from HTML and JavaScript to
                                modern frameworks and real-world project skills.
                            </p>
                            <div className={styles.featuredActions}>
                                <button type="button" className={styles.primaryAction}>
                                    <MdPlayArrow /> Play
                                </button>
                                <button type="button" className={styles.secondaryAction}>
                                    <MdShare /> Share
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className={styles.videoSection}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h2>{activeTab === "Home" ? "Latest uploads" : activeTab}</h2>
                                <p>Fresh from the channel</p>
                            </div>
                            <div className={styles.sectionTools}>
                                <button type="button" aria-label="Sort videos"><MdSort /></button>
                                <button type="button" aria-label="Grid view"><MdGridView /></button>
                            </div>
                        </div>

                        <div className={styles.videoGrid}>
                            {videos.map((video) => (
                                <article className={styles.videoCard} key={video.id}>
                                    <div className={styles.thumbnail}>
                                        <img src={video.image} alt="" />
                                        <span className={styles.duration}>{video.duration}</span>
                                        <button type="button" className={styles.cardPlay} aria-label={`Play ${video.title}`}>
                                            <MdPlayArrow />
                                        </button>
                                    </div>
                                    <div className={styles.cardDetails}>
                                        <div>
                                            <h3>{video.title}</h3>
                                            <p>{video.meta}</p>
                                        </div>
                                        <button type="button" className={styles.cardMenu} aria-label="Video options">
                                            <MdMoreVert />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.statsStrip}>
                        <div className={styles.statsTitle}>
                            <MdBarChart />
                            <div>
                                <span>Channel performance</span>
                                <strong>Last 28 days</strong>
                            </div>
                        </div>
                        <div className={styles.stat}>
                            <strong>1.8M</strong>
                            <span>Views</span>
                        </div>
                        <div className={styles.stat}>
                            <strong>+12.4K</strong>
                            <span>Watch time</span>
                        </div>
                        <div className={styles.stat}>
                            <strong>+4.2K</strong>
                            <span>Subscribers</span>
                        </div>
                        <button type="button" className={styles.editButton}>
                            <MdEdit /> Analytics
                        </button>
                    </section>
                </main>
            </div>
        </div>
    );
}