"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdCheckCircle, MdClose, MdErrorOutline, MdImage, MdUpload, MdVideoLibrary } from "react-icons/md";
import { checkAlreadyLogin } from "@/services/AuthUser";
import { getMyChannel } from "@/services/channel.services";
import { uploadVideo } from "@/services/videos";
import styles from "../../../../components/styleSheets/uploadVideo.module.css";

const initialForm = {
    title: "",
    description: "",
    category: "",
    duration: "",
    tags: "",
    visibility: "public",
    channelId: "",
};

const VIDEO_LIMIT = 5 * 1024 * 1024;
const IMAGE_LIMIT = 1 * 1024 * 1024;

export default function UploadVideoPage() {
    const router = useRouter();
    const videoInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);
    const [form, setForm] = useState(initialForm);
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState("");
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => () => {
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    }, [videoPreview, thumbnailPreview]);

    const uploadVideoToDb = async (payload) => {
        const isLoggedInResponse = await checkAlreadyLogin();
        if (!isLoggedInResponse?.success) {
            router.push("/login");
            throw new Error("Please log in before uploading a video.");
        }

        const isChannelResponse = await getMyChannel();
        if (!isChannelResponse?.success) {
            throw new Error(isChannelResponse?.message || "Unable to verify your channel.");
        }

        if (!isChannelResponse.channel?._id) {
            router.push("/user/createChannel");
            throw new Error("Create a channel before uploading a video.");
        }

        payload.set("channelId", isChannelResponse.channel._id);
        const uploadVideoResponse = await uploadVideo(payload);
        if (!uploadVideoResponse?.success) {
            throw new Error(uploadVideoResponse?.message || "Failed to upload video.");
        }
        router.push("/user/my-channel");

        return uploadVideoResponse;
    };
    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setError("");
        setSuccess("");
    };

    const selectVideo = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!["video/mp4", "video/avi", "video/quicktime"].includes(file.type)) {
            setError("Please choose an MP4, AVI, or MOV video.");
            event.target.value = "";
            return;
        }

        if (file.size > VIDEO_LIMIT) {
            setError("Video size must be 5 MB or less.");
            event.target.value = "";
            return;
        }

        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setError("");
    };

    const selectThumbnail = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("Please choose a JPG, PNG, or WebP thumbnail.");
            event.target.value = "";
            return;
        }

        if (file.size > IMAGE_LIMIT) {
            setError("Thumbnail size must be 1 MB or less.");
            event.target.value = "";
            return;
        }

        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
        setError("");
    };

    const setVideoDuration = (event) => {
        const duration = event.currentTarget.duration;
        if (Number.isFinite(duration) && duration > 0) {
            setForm((current) => ({ ...current, duration: String(Math.ceil(duration)) }));
        }
    };

    const clearVideo = () => {
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoFile(null);
        setVideoPreview("");
        if (videoInputRef.current) videoInputRef.current.value = "";
        setForm((current) => ({ ...current, duration: "" }));
    };

    const clearThumbnail = () => {
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailFile(null);
        setThumbnailPreview("");
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    };

    const submitVideo = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!videoFile) {
            setError("Please choose a video to upload.");
            return;
        }

        if (!thumbnailFile) {
            setError("Please choose a thumbnail image.");
            return;
        }

        const tags = form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        if (!tags.length) {
            setError("Add at least one tag.");
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("category", form.category);
            formData.append("duration", form.duration);
            formData.append("tags", JSON.stringify(tags));
            formData.append("visibility", form.visibility);
            if (form.channelId) formData.append("channelId", form.channelId);
            formData.append("video", videoFile);
            formData.append("thumbnailImage", thumbnailFile);

            await uploadVideoToDb(formData);

            setSuccess("Your video was uploaded successfully.");
            setForm(initialForm);
            clearVideo();
            clearThumbnail();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                requestError.response?.data?.error ||
                requestError.message ||
                "Unable to upload the video. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.pageWrap}>
                <Link href="/dashboard/videos" className={styles.backLink}>
                    <MdArrowBack />
                    Back to videos
                </Link>

                <form onSubmit={submitVideo} className={styles.uploadCard}>
                    <header className={styles.formHeader}>
                        <div className={styles.headerIcon}><MdUpload /></div>
                        <div>
                            <h1>Upload a video</h1>
                            <p>Add your file and tell viewers what it is about.</p>
                        </div>
                    </header>

                    {error && (
                        <div className={styles.messageError}><MdErrorOutline /><span>{error}</span></div>
                    )}
                    {success && (
                        <div className={styles.messageSuccess}><MdCheckCircle /><span>{success}</span></div>
                    )}

                    <div className={styles.formBody}>
                        <section className={styles.mediaGrid}>
                            <div className={styles.mediaField}>
                                <div className={styles.mediaLabel}>Video file <span>Max 5 MB</span></div>
                                <div className={`${styles.uploadBox} ${videoPreview ? styles.hasPreview : ""}`}>
                                    {videoPreview ? (
                                        <>
                                            <video src={videoPreview} controls onLoadedMetadata={setVideoDuration} />
                                            <button type="button" className={styles.removeButton} onClick={clearVideo} aria-label="Remove video"><MdClose /></button>
                                        </>
                                    ) : (
                                        <label htmlFor="video-file" className={styles.emptyUpload}>
                                            <MdVideoLibrary />
                                            <strong>Choose video</strong>
                                            <span>MP4, AVI or MOV</span>
                                        </label>
                                    )}
                                    <input
                                        ref={videoInputRef}
                                        id="video-file"
                                        type="file"
                                        accept="video/mp4,video/avi,video/quicktime"
                                        onChange={selectVideo}
                                        className="sr-only"
                                    />
                                </div>
                            </div>

                            <div className={styles.mediaField}>
                                <div className={styles.mediaLabel}>Thumbnail <span>Max 1 MB</span></div>
                                <div className={`${styles.uploadBox} ${thumbnailPreview ? styles.hasPreview : ""}`}>
                                    {thumbnailPreview ? (
                                        <>
                                            <img src={thumbnailPreview} alt="Thumbnail preview" />
                                            <button type="button" className={styles.removeButton} onClick={clearThumbnail} aria-label="Remove thumbnail"><MdClose /></button>
                                        </>
                                    ) : (
                                        <label htmlFor="thumbnail-file" className={styles.emptyUpload}>
                                            <MdImage />
                                            <strong>Choose thumbnail</strong>
                                            <span>JPG, PNG or WebP</span>
                                        </label>
                                    )}
                                    <input
                                        ref={thumbnailInputRef}
                                        id="thumbnail-file"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={selectThumbnail}
                                        className="sr-only"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={styles.detailsGrid}>
                            <label className={styles.field}>
                                <span>Title</span>
                                <input name="title" value={form.title} onChange={updateField} required maxLength={150} placeholder="Add a clear title" />
                            </label>

                            <label className={styles.field}>
                                <span>Category</span>
                                <select name="category" value={form.category} onChange={updateField} required>
                                    <option value="">Select category</option>
                                    <option value="Education">Education</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Music">Music</option>
                                    <option value="Sports">Sports</option>
                                    <option value="News">News</option>
                                    <option value="Gaming">Gaming</option>
                                    <option value="Lifestyle">Lifestyle</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>Duration <small>seconds</small></span>
                                <input name="duration" type="number" min="1" value={form.duration} onChange={updateField} required placeholder="Detected automatically" />
                            </label>

                            <label className={styles.field}>
                                <span>Visibility</span>
                                <select name="visibility" value={form.visibility} onChange={updateField} required>
                                    <option value="public">Public</option>
                                    <option value="unlisted">Unlisted</option>
                                    <option value="private">Private</option>
                                </select>
                            </label>

                            <label className={`${styles.field} ${styles.fullField}`}>
                                <span>Tags</span>
                                <input name="tags" value={form.tags} onChange={updateField} required placeholder="travel, nature, vlogs" />
                                <small>Separate tags with commas</small>
                            </label>

                            <label className={`${styles.field} ${styles.fullField}`}>
                                <span>Description</span>
                                <textarea name="description" value={form.description} onChange={updateField} required maxLength={5000} rows={5} placeholder="Tell viewers about your video" />
                            </label>
                        </section>
                    </div>

                    <footer className={styles.formActions}>
                        <Link href="/dashboard/videos" className={styles.cancelButton}>Cancel</Link>
                        <button type="submit" disabled={submitting} className={styles.submitButton}>
                            {submitting ? "Uploading..." : "Upload video"}
                        </button>
                    </footer>
                </form>
            </div>
        </main>
    );
}