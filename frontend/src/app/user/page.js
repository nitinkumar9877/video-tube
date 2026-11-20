"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdAdd, MdArrowForward, MdEdit, MdHistory, MdOutlineVideoLibrary, MdSubscriptions, MdVideoCall, } from "react-icons/md";
import styles from "../../components/styleSheets/userProfile.module.css";
import { checkAlreadyLogin, FetchUserData } from "@/services/AuthUser";
import { getMyChannel } from "@/services/channel.services";

export default function UserPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const initializeUser = async () => {
            try {
                // Step 1: Get user data from localStorage
                // cancel because we fetch user data from backend instead of localStorage

                // Step 2: Check authentication
                const response = await checkAlreadyLogin();

                if (!response?.success) {
                    router.replace("/login");
                    return;
                }
                const userData = await FetchUserData(); // Fetch user data from the backend
                if (!userData?.success) {
                    router.replace("/login");
                    return;
                }
                setUser(userData.data.user);

                // Step 3: Fetch channel data after authentication
                const channelResponse = await getMyChannel();
                if (!channelResponse?.success) {
                    console.error("Failed to fetch channel data:", channelResponse?.message || "Unknown error");
                    setChannel(null);
                    return;
                } else {
                    setChannel(channelResponse.channel);
                    return;
                }

            } catch (error) {
                console.error("Error initializing user:", error);
                setChannel(null);
                return;

            } finally {
                setLoading(false);
            }
        };

        initializeUser();

    }, [router]);

    const displayName = user?.username || user?.name || user?.email?.split("@")[0] || "Your Profile";
    const initials = displayName
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "Y";

    return (
        <div className={styles.page}>
            <div className={styles.profileCard}>
                <div className={styles.cover}>
                    <div className={styles.coverPattern} />
                </div>

                <div className={styles.profileHeader}>
                    <div className={styles.identity}>
                        {user?.profilePictureUrl ? (
                            <Image
                                src={user.profilePictureUrl}
                                alt={displayName}
                                width={112}
                                height={112}
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatar} aria-label={`${displayName} avatar`}>
                                {initials}
                            </div>
                        )}

                        <div className={styles.identityText}>
                            <h1 className={styles.identityNameHeading}>{displayName}</h1>
                            {user?.email && <p>{user.email}</p>}
                            {channel && (
                                <p className={styles.handle}>@{channel.channelHandle}</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.profileActions}>
                        {loading ? (
                            <button type="button" className={styles.primaryButton} disabled>
                                Checking channel...
                            </button>
                        ) : channel ? (
                            <>
                                <Link
                                    href="/user/my-channel"
                                    className={styles.primaryButton}
                                >
                                    Go to channel
                                    <MdArrowForward />
                                </Link>
                                {/* <Link href="/user/channel" className={styles.secondaryButton}>
                                    <MdEdit />
                                    Manage
                                </Link> */}
                            </>
                        ) : (
                            <Link href="/user/createChannel" className={styles.primaryButton}>
                                <MdVideoCall />
                                Create channel
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <section className={styles.channelPanel}>
                    <div className={styles.panelHeading}>
                        <div>
                            <p className={styles.eyebrow}>Channel</p>
                            <h2>{channel ? channel.channelName : "Share your creativity"}</h2>
                        </div>
                        {channel && (
                            <Link href={`/user/channel/${channel._id}`} className={styles.textLink}>
                                View channel
                                <MdArrowForward />
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <MdOutlineVideoLibrary />
                            </div>
                            <p>Checking your channel status...</p>
                        </div>
                    ) : channel ? (
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span>Subscribers</span>
                                <strong>{channel.subscribersCount || 0}</strong>
                            </div>
                            <div className={styles.statCard}>
                                <span>Videos</span>
                                <strong>{channel.totalVideos || 0}</strong>
                            </div>
                            <div className={styles.statCard}>
                                <span>Views</span>
                                <strong>{channel.totalViews || 0}</strong>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <MdAdd />
                            </div>
                            <h3>Create a channel</h3>
                            <p>Start uploading videos and build your audience on PlayTube.</p>
                            <Link href="/user/createChannel" className={styles.emptyButton}>
                                Get started
                                <MdArrowForward />
                            </Link>
                        </div>
                    )}
                </section>

                <aside className={styles.quickPanel}>
                    <h2>Quick links</h2>
                    {channel && (
                        <>
                            <Link href="/user/my-channel/upload" className={styles.quickLink}>
                                <span className={styles.quickIcon}>
                                    <MdVideoCall />
                                </span>
                                <span>
                                    <strong>Upload a video</strong>
                                    <small>Share something new</small>
                                </span>
                                <MdArrowForward />
                            </Link>

                            <Link href="/user/subscribe" className={styles.quickLink}>
                                <span className={styles.quickIcon}>
                                    <MdSubscriptions />
                                </span>
                                <span>
                                    <strong>Subscribe</strong>
                                    <small>Explore channels</small>
                                </span>
                                <MdArrowForward />
                            </Link>
                            <Link href="/user/my-channel/my-videos" className={styles.quickLink}>
                                <span className={styles.quickIcon}>
                                    <MdOutlineVideoLibrary />
                                </span>
                                <span>
                                    <strong>Your videos</strong>
                                    <small>Manage uploads</small>
                                </span>
                                <MdArrowForward />
                            </Link>
                        </>
                    )}
                    <Link href="/user/history" className={styles.quickLink}>
                        <span className={styles.quickIcon}>
                            <MdHistory />
                        </span>
                        <span>
                            <strong>Watch history</strong>
                            <small>Continue watching</small>
                        </span>
                        <MdArrowForward />
                    </Link>
                </aside>
            </div>
        </div>
    );
}