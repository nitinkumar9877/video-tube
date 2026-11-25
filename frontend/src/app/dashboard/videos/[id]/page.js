"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff, MdThumbUp, MdThumbUpOffAlt, MdShare, MdBookmarkBorder, MdMoreHoriz, MdCheck, } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import styles from "../../../../components/styleSheets/videoPlay.module.css";
import { commentDelete, doLikeVideo, getComments, getVideoById, submitVideoComment } from "@/services/videos";
import { checkAlreadyLogin, FetchUserData } from "@/services/AuthUser";
import { toggalSubscribeChannel } from "@/services/channel.services";

const formatTime = (seconds = 0) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        : `${minutes}:${String(secs).padStart(2, "0")}`;
};

const formatCount = (count = 0) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return String(count);
};

const addCommentOwnership = (comments, userId = "") =>
    Array.isArray(comments)
        ? comments.map((comment) => {
            const commentUserId = typeof comment.user === "object"
                ? comment.user?._id
                : comment.user;
            return {
                ...comment,
                myComment: Boolean(userId) && String(commentUserId || "") === String(userId),
            };
        })
        : [];

export default function VideoPlayPage() {
    const router = useRouter();
    const params = useParams();
    const videoRef = useRef(null);
    const id = params?.id ? decodeURIComponent(params.id) : "";
    const [video, setVideo] = useState({});
    const [loading, setLoading] = useState(Boolean(id));
    const [error, setError] = useState("");
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState();
    const [subscribed, setSubscribed] = useState();
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");

    useEffect(() => {
        if (!id) return;
        // let mounted = true;
        const loadVideo = async () => {
            try {
                const response = await getVideoById(id);
                if (!response || !response.success) {
                    throw new Error("Failed to fetch video data");
                }
                const data = response?.data;

                if (data) {
                    setVideo(data);
                    setLikeCount(Array.isArray(data.likes) ? data.likes.length : 0);
                }
                const getVideoAllComments = await getComments(id);
                if (getVideoAllComments?.success) {
                    setVideo((prevVideo) => ({
                        ...prevVideo,
                        comments: addCommentOwnership(getVideoAllComments?.data),
                    }));
                } else {
                    console.error("Failed to fetch comments:", getVideoAllComments?.message);
                };
                const checkLogin = await checkAlreadyLogin();
                if (checkLogin?.success) {
                    const userResponse = await FetchUserData();
                    const user = userResponse?.data?.user;

                    if (user) {
                        const userId = String(user._id || "");
                        setCurrentUserId(userId);
                        const likedByUser = Array.isArray(data?.likes)
                            && data.likes.some((like) => {
                                const likeId = typeof like === "object" ? like._id : like;
                                return String(likeId) === userId;
                            });

                        const subscribedChannelIds = Array.isArray(user.subscribedChannels)
                            ? user.subscribedChannels.map((channel) =>
                                String(typeof channel === "object" ? channel._id : channel)
                            )
                            : [];

                        setLiked(likedByUser);
                        setSubscribed(
                            subscribedChannelIds.includes(String(data?.channel?._id || ""))
                        );

                        setVideo((prevVideo) => ({
                            ...prevVideo,
                            comments: addCommentOwnership(prevVideo.comments, userId),
                        }));

                    } else {
                        setCurrentUserId("");
                        setLiked(false);
                        setSubscribed(false);
                    }
                } else {
                    setCurrentUserId("");
                    setLiked(false);
                    setSubscribed(false);
                }
                { console.log("Video data loaded:", video) }

            } catch (loadError) {
                setVideo({});
                setLikeCount(0);
                setError(loadError?.message || "Unable to load this video.");
            } finally {
                setLoading(false);
                // mounted && setLoading(false);
            }
        };

        loadVideo();
    }, [id]);

    const togglePlayback = async () => {
        const element = videoRef.current;
        if (!element) return;

        if (element.paused) {
            try {
                await element.play();
            } catch {
                setError("Playback could not start. Please try again.");
            }
        } else {
            element.pause();
        }
    };

    const toggleMute = () => {
        const element = videoRef.current;
        if (!element) return;
        element.muted = !element.muted;
        setMuted(element.muted);
    };

    const seek = (event) => {
        const element = videoRef.current;
        if (!element) return;
        const nextTime = Number(event.target.value);
        element.currentTime = nextTime;
        setCurrentTime(nextTime);
    };

    const toggleLike = async () => {
        let checkLogin;

        try {
            checkLogin = await checkAlreadyLogin();
        } catch (authError) {
            setError(authError?.message || "Unable to check login status");
            return;
        }

        if (!checkLogin?.success) {
            router.push("/login");
            return;
        }

        const previousLiked = liked;
        const nextLiked = !previousLiked;
        setLiked(nextLiked);
        setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

        try {
            const response = await doLikeVideo(video._id);
            if (!response?.success) {
                throw new Error("Failed to like/unlike video");
            }

            const serverData = response?.data;
            if (typeof serverData?.isLiked === "boolean") {
                setLiked(serverData.isLiked);
            }
            if (typeof serverData?.likesCount === "number") {
                setLikeCount(serverData.likesCount);
            }
        } catch (likeError) {
            setLiked(previousLiked);
            setLikeCount((count) => Math.max(0, count + (nextLiked ? -1 : 1)));
            setError(likeError?.message || "Failed to like/unlike video");
        }
    };

    // http://localhost:1111/api/auth/videos/6b0035e9b032860cf4e28976/comment

    const toggalSubscribe = async (channelId) => {
        if (!channelId) {
            setError("Channel information is unavailable.");
            return;
        }

        try {
            const checkLogin = await checkAlreadyLogin();
            if (!checkLogin?.success) {
                router.push("/login");
                return;
            }
        } catch (authError) {
            setError(authError?.message || "Unable to check login status");
            return;
        }

        try {
            const response = await toggalSubscribeChannel(channelId);
            if (!response?.success) {
                const message = response?.message || "Failed to toggle subscribe.";
                console.error("Failed to toggle subscribe:", message);
                setError(message);
                return;
            }

            setSubscribed(response.isSubscribed);
            setError("");
            setVideo((currentVideo) => ({
                ...currentVideo,
                channel: currentVideo?.channel
                    ? {
                        ...currentVideo.channel,
                        subscribersCount: Math.max(
                            0,
                            (currentVideo.channel.subscribersCount || 0)
                            + (response.isSubscribed ? 1 : -1)
                        ),
                    }
                    : currentVideo.channel,
            }));
        } catch (subscriptionError) {
            setError(subscriptionError?.message || "Failed to toggle subscribe.");
        }
    };

    const submitComment = async (event) => {
        event.preventDefault();
        const comment = commentText.trim();
        if (!comment || !video?._id || submittingComment) return;

        setSubmittingComment(true);
        try {
            const checkLogin = await checkAlreadyLogin();
            if (!checkLogin?.success) {
                router.push("/login");
                return;
            }

            const response = await submitVideoComment(comment, video._id);
            if (!response?.success) {
                setError(response?.message || "Failed to submit comment.");
                return;
            }

            setCommentText("");
            setError("");
            const getVideoAllComments = await getComments(id);
            if (getVideoAllComments?.success) {
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    comments: addCommentOwnership(getVideoAllComments?.data, currentUserId),
                }));
            } else {
                console.error("Failed to fetch comments:", getVideoAllComments?.message);
            };

        } catch (commentError) {
            setError(commentError?.message || "Failed to submit comment.");
        } finally {
            setSubmittingComment(false);
        }
    };

    const deleteComment = (commentId) => async () => {
        if (!commentId || !video?._id) return;

        try {
            const checkLogin = await checkAlreadyLogin();
            if (!checkLogin?.success) {
                router.push("/login");
                return;
            }
            
            const response = await commentDelete(video._id, commentId);
            if (!response?.success) {
                setError(response?.message || "Failed to delete comment.");
                return;
            }

            setError("");
            const getVideoAllComments = await getComments(id);
            if (getVideoAllComments?.success) {
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    comments: addCommentOwnership(getVideoAllComments?.data, currentUserId),
                }));
            } else {
                console.error("Failed to fetch comments:", getVideoAllComments?.message);
            };

        } catch (deleteError) {
            setError(deleteError?.message || "Failed to delete comment.");
        }
    };

    if (!id) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingCard} role="alert">Video ID is missing.</div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingCard}>Loading video...</div>
            </main>
        );
    }

    const channelName = video?.channel?.channelName || video?.channel?.name || video?.owner?.username || "Channel";
    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <section className={styles.primaryColumn}>
                    <article className={styles.player}>
                        <video
                            ref={videoRef}
                            src={video?.videoUrl}
                            poster={video?.thumbnailUrl}
                            preload="metadata"
                            playsInline
                            onClick={togglePlayback}
                            onPlay={() => setPlaying(true)}
                            onPause={() => setPlaying(false)}
                            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                            onDurationChange={(event) => setDuration(event.currentTarget.duration)}
                            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                        />

                        <button
                            type="button"
                            className={`${styles.centerPlay} ${playing ? styles.centerPlayHidden : ""}`}
                            onClick={togglePlayback}
                            aria-label={playing ? "Pause video" : "Play video"}
                        >
                            {playing ? <MdPause /> : <MdPlayArrow />}
                        </button>

                        <div className={styles.playerControls}>
                            <input
                                className={styles.timeline}
                                type="range"
                                min="0"
                                max={duration || 0}
                                step="0.1"
                                value={currentTime}
                                onChange={seek}
                                style={{ "--progress": `${progress}%` }}
                                aria-label="Video progress"
                            />
                            <div className={styles.controlRow}>
                                <button type="button" onClick={togglePlayback} aria-label={playing ? "Pause" : "Play"}>
                                    {playing ? <MdPause /> : <MdPlayArrow />}
                                </button>
                                <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                                    {muted ? <MdVolumeOff /> : <MdVolumeUp />}
                                </button>
                                <span className={styles.time}>{formatTime(currentTime)} / {formatTime(duration)}</span>
                                {/* <button type="button" className={styles.fullscreenButton} onClick={toggleFullscreen} aria-label="Fullscreen">
                                    <MdFullscreen />
                                </button> */}
                            </div>
                        </div>
                    </article>

                    <div className={styles.videoInfo}>
                        {error && (
                            <p role="alert" style={{ color: "#ef4444" }}>
                                {error}
                            </p>
                        )}
                        <h1>{video?.title || "Untitled video"}</h1>
                        <p>{formatCount(video?.views)} views <span>•</span> {video?.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "Recently uploaded"}</p>

                        <div className={styles.channelRow}>
                            <div className={styles.channelIdentity}>
                                <div className={styles.channelAvatar}>{channelName.charAt(0).toUpperCase()}</div>
                                <div>
                                    <strong>{channelName}</strong>
                                    <span>{formatCount(video?.channel?.subscribersCount)} subscribers</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className={`${styles.subscribeButton} ${subscribed ? styles.subscribed : ""}`}
                                onClick={() => toggalSubscribe(video?.channel?._id)}
                            >
                                {subscribed && <MdCheck />}
                                {subscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        </div>

                        <div className={styles.actionRow}>
                            <button
                                type="button"
                                className={`${styles.actionButton} ${liked ? styles.activeAction : ""}`}
                                onClick={toggleLike}
                            >
                                {liked ? <MdThumbUp /> : <MdThumbUpOffAlt />}
                                <span>{formatCount(likeCount)}</span>
                            </button>
                            <button type="button" className={styles.actionButton} onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                                <MdShare />
                                <span>Share</span>
                            </button>
                            <button type="button" className={styles.actionButton}>
                                <MdBookmarkBorder />
                                <span>Save</span>
                            </button>
                            <button type="button" className={styles.iconButton} aria-label="More options"><MdMoreHoriz /></button>
                        </div>

                        <div className={styles.descriptionBox}>
                            <div><strong>{formatCount(video?.views)} views</strong><span>{video?.category || "Video"}</span></div>
                            <p>{video?.description || "No description available."}</p>
                        </div>
                    </div>

                    <div className={styles.commentDiv}>
                        <form onSubmit={submitComment} className={styles.commentForm}>
                            <input
                                name="comment"
                                value={commentText}
                                onChange={(event) => setCommentText(event.target.value)}
                                type="text"
                                placeholder="Enter your comment for current video"
                                className={styles.commentInput}
                                maxLength={2000}
                                aria-label="Comment"
                            />
                            <button type="submit" disabled={!commentText.trim() || submittingComment}>
                                {submittingComment ? "Submitting..." : "Submit"}
                            </button>
                        </form>

                        <div className={styles.commentList}>
                            {video?.comments?.length > 0 ? (
                                video.comments.map((comment) => (
                                    <div key={comment._id} className={styles.commentItem}>
                                        <div className={styles.commentHeader}>
                                            <div className={styles.commentUser}>
                                                {comment.user?.profilePictureUrl ? (
                                                    <img className={styles.commentAvatar} src={comment.user.profilePictureUrl} alt={`${comment.user.username}'s profile picture`} width={34} height={34} />
                                                ) : (
                                                    <div className={styles.commentAvatar}>{comment.user?.username?.charAt(0).toUpperCase() || "A"}</div>
                                                )}
                                                <strong>{comment.user?.username || "Anonymous"}</strong>
                                            </div>
                                            {comment.myComment && (
                                                <span className={styles.commentOwnerBadge}>
                                                    <MdDelete onClick={deleteComment(comment._id)} size={24} className={styles.deleteIcon} />
                                                </span>
                                            )}
                                        </div>
                                        <p className={styles.commentText}>{comment.comment}</p>
                                        <span className={styles.commentDate}>{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p>No comments yet. Be the first to comment!</p>
                            )}
                        </div>

                    </div>
                </section>

                {/* <aside className={styles.upNext}>
                    <h2>Up next</h2>
                    {[
                        ["The Long Way to the Sea", "820K views"],
                        ["Morning in the Highlands", "412K views"],
                        ["Inside a Quiet Mountain Town", "1.2M views"],
                        ["Five Hidden Places Worth the Drive", "236K views"],
                    ].map(([title, views]) => (
                        <Link href="/" className={styles.suggestion} key={title}>
                            <div className={styles.suggestionThumb}><MdPlayArrow /></div>
                            <div className={styles.suggestionText}>
                                <strong>{title}</strong>
                                <span>{channelName}</span>
                                <span>{views}</span>
                            </div>
                        </Link>
                    ))}
                </aside> */}
            </div>
        </main>
    );
}