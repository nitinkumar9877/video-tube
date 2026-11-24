"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdCheck, MdNotificationsNone, MdOutlineVideoLibrary } from "react-icons/md";

import styles from "@/components/styleSheets/subscribe.module.css";
import { fetchSubscribedChannels, toggalSubscribeChannel } from "@/services/channel.services";

export default function SubscribePage() {
    const [channels, setChannels] = useState([]);
    const [Subscribe, setSubscribe] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscribed = async () => {
            try {
                const response = await fetchSubscribedChannels();

                if (!response.success) {
                    console.error(
                        "Failed to fetch subscribed channels:",
                        response.message
                    );
                    return;
                }

                // Adjust this according to your actual API response structure.
                const channelData = Array.isArray(response.channels)
                    ? response.channels
                    : [];

                setChannels(channelData);

                // Initialize subscription state
                const subscriptionState = Object.fromEntries(
                    channelData.map((channel) => [
                        channel._id,
                        true
                    ])
                );

                setSubscribe(subscriptionState);

            } catch (error) {
                console.error("Error fetching subscribed channels:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscribed();
    }, []);

    const toggleSubscription = async (channelId) => {
        try {
            const response = await toggalSubscribeChannel(channelId);
            if (!response.success) {
                console.error(
                    "Failed to toggle subscription:",
                    response.message
                );
                return;
            }

            const isSubscribed = response.isSubscribed;

            setSubscribe((current) => ({
                ...current,
                [channelId]: isSubscribed,
            }));
        } catch (error) {
            console.error("Error toggling subscription:", error);
        }
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

                    <div className={styles.feedCount}>
                        {subscribedCount} subscribed
                    </div>
                </header>

                <div className={styles.contentGrid}>

                    <section
                        className={styles.channelList}
                        aria-label="Subscribed channels"
                    >

                        {loading ? (
                            <p>Loading subscribed channels...</p>
                        ) : channels.length === 0 ? (
                            <p>You haven&apos;t subscribed to any channels yet.</p>
                        ) : (
                            channels.map((channel) => {
                                const channelId = channel._id;
                                const subscribed = Subscribe[channelId] ?? true;

                                return (
                                    <article
                                        className={styles.channelCard}
                                        key={channelId}
                                    >

                                        <Link
                                            href={`/channel/${channel.channelHandle}`}
                                            className={styles.channelIdentity}
                                        >
                                            <div className={styles.channelAvatar}>
                                                {channel.channelLogo ? (
                                                    <Image
                                                        src={channel.channelLogo}
                                                        alt={channel.channelName}
                                                        width={48}
                                                        height={48}
                                                    />
                                                ) : (
                                                    channel.channelName
                                                        ?.charAt(0)
                                                        .toUpperCase()
                                                )}
                                            </div>

                                            <div className={styles.channelDetails}>
                                                <h2>{channel.channelName}</h2>

                                                <p>
                                                    @{channel.channelHandle}
                                                </p>

                                                <p>
                                                    {channel.subscribersCount} subscribers
                                                    {" · "}
                                                    {channel.totalVideos} videos
                                                </p>
                                            </div>
                                        </Link>

                                        <div className={styles.cardActions}>

                                            <button
                                                type="button"
                                                className={styles.notificationButton}
                                                aria-label={`Notifications for ${channel.channelName}`}
                                            >
                                                <MdNotificationsNone />
                                            </button>

                                            <button
                                                type="button"
                                                className={`${styles.subscriptionButton} ${subscribed
                                                    ? styles.subscribed
                                                    : styles.unsubscribed
                                                    }`}
                                                onClick={() => toggleSubscription(channelId)}
                                                aria-pressed={subscribed}
                                            >
                                                {subscribed && <MdCheck />}

                                                {subscribed
                                                    ? "Subscribed"
                                                    : "Subscribe"}
                                            </button>

                                        </div>
                                    </article>
                                );
                            })
                        )}

                    </section>

                    <aside className={styles.feedPanel}>

                        <div className={styles.feedHeading}>
                            <MdOutlineVideoLibrary />

                            <div>
                                <strong>Latest uploads</strong>
                                <span>From your Subscribe</span>
                            </div>
                        </div>

                        {channels.slice(0, 3).map((channel) => (
                            <div
                                className={styles.uploadItem}
                                key={channel._id}
                            >
                                <div className={styles.videoThumb}>
                                    <MdOutlineVideoLibrary />
                                </div>

                                <div className={styles.uploadDetails}>
                                    <strong>{channel.channelName}</strong>
                                    <span>@{channel.channelHandle}</span>
                                    <span>
                                        {channel.totalVideos} videos
                                    </span>
                                </div>
                            </div>
                        ))}

                    </aside>

                </div>
            </div>
        </main>
    );
}