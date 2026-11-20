"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdCheck, MdNotificationsNone, MdOutlineVideoLibrary } from "react-icons/md";
import styles from "@/components/styleSheets/subscribe.module.css";

// const channels = [
//     { id: 1, name: "Northbound", handle: "@northbound", initials: "N", subscribers: "284K", videos: 126, accent: "#ef4444", subscribed: true },
//     { id: 2, name: "Design with Code", handle: "@designwithcode", initials: "D", subscribers: "1.8M", videos: 342, accent: "#2563eb", subscribed: true },
//     { id: 3, name: "Wander Stories", handle: "@wanderstories", initials: "W", subscribers: "842K", videos: 89, accent: "#059669", subscribed: true },
//     { id: 4, name: "Kitchen Notes", handle: "@kitchennotes", initials: "K", subscribers: "612K", videos: 214, accent: "#ea580c", subscribed: false },
//     { id: 5, name: "Studio North", handle: "@studionorth", initials: "S", subscribers: "326K", videos: 74, accent: "#7c3aed", subscribed: false },
//     { id: 6, name: "Code Explained", handle: "@codeexplained", initials: "C", subscribers: "975K", videos: 188, accent: "#0891b2", subscribed: true },
// ];

export default function SubscribePage() {
    const [Subscribe, setSubscribe] = useState(() =>
        Object.fromEntries(channels.map((channel) => [channel.id, channel.subscribed]))
    );

    const [channels, setChannels] = useState();

    useEffect(() => {
        const fetchSubscribed = async () => {
            try {
                const response = await fetchSubscribedChannels();
                if (!response.success) {
                    console.error("Failed to fetch subscribed channels:", response.message);
                    return;
                }
                if (response.data && Array.isArray(response.data)) {
                    setChannels(response.data);
                }
            } catch (error) {
                console.error("Error fetching subscribed channels:", error);
            }
        };

        fetchSubscribed();
    }, []);

    const toggleSubscription = (channelId) => {
        setSubscribe((current) => ({
            ...current,
            [channelId]: !current[channelId],
        }));
    };

    const subscribedCount = Object.values(Subscribe).filter(Boolean).length;

    return (
        <main className={styles.page}>
            <div className={styles.pageWrap}>
                <header className={styles.pageHeader}>
                    <div>
                        <p className={styles.eyebrow}>Your feed</p>
                        <h1>Subscribe</h1>
                    </div>
                    <div className={styles.feedCount}>{subscribedCount} subscribed</div>
                </header>

                <div className={styles.contentGrid}>
                    <section className={styles.channelList} aria-label="Subscribed channels">
                        {channels.map((channel) => {
                            const subscribed = Subscribe[channel.id];

                            return (
                                <article className={styles.channelCard} key={channel.id}>
                                    <Link href="/" className={styles.channelIdentity}>
                                        <div
                                            className={styles.channelAvatar}
                                            style={{ "--avatar-accent": channel.accent }}
                                        >
                                            {channel.initials}
                                        </div>
                                        <div className={styles.channelDetails}>
                                            <h2>{channel.name}</h2>
                                            <p>{channel.handle}</p>
                                            <p>{channel.subscribers} subscribers · {channel.videos} videos</p>
                                        </div>
                                    </Link>

                                    <div className={styles.cardActions}>
                                        <button
                                            type="button"
                                            className={styles.notificationButton}
                                            aria-label={`Notifications for ${channel.name}`}
                                        >
                                            <MdNotificationsNone />
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.subscriptionButton} ${subscribed ? styles.subscribed : styles.unsubscribed}`}
                                            onClick={() => toggleSubscription(channel.id)}
                                            aria-pressed={subscribed}
                                        >
                                            {subscribed && <MdCheck />}
                                            {subscribed ? "Subscribed" : "Subscribe"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <aside className={styles.feedPanel}>
                        <div className={styles.feedHeading}>
                            <MdOutlineVideoLibrary />
                            <div>
                                <strong>Latest uploads</strong>
                                <span>From your Subscribe</span>
                            </div>
                        </div>

                        {[1, 2, 3].map((item) => (
                            <Link href="/" className={styles.uploadItem} key={item}>
                                <div className={styles.videoThumb}>
                                    <span>0:{12 + item * 7}</span>
                                </div>
                                <div className={styles.uploadDetails}>
                                    <strong>{item === 1 ? "A quiet morning outside the city" : item === 2 ? "Design systems that scale clearly" : "Three simple meals for busy days"}</strong>
                                    <span>{channels[item - 1].name}</span>
                                    <span>{item * 48}K views · 1 day ago</span>
                                </div>
                            </Link>
                        ))}
                    </aside>
                </div>
            </div>
        </main>
    );
}