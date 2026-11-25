"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBack, MdCheck, MdClose, MdMovieEdit, MdSell } from "react-icons/md";
import { checkAlreadyLogin } from "@/services/AuthUser";
import { getVideoById, editVideoDetails, deleteVideo } from "@/services/videos";
import styles from "../../../../../components/styleSheets/editVideo.module.css";


const categories = ["Education", "Entertainment", "Music", "Sports", "News", "Gaming", "Lifestyle", "Other",];

const EditPage = () => {
    const router = useRouter();
    const params = useParams();
    const videoId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const [video, setVideo] = useState(null);
    const [form, setForm] = useState({ title: "", description: "", category: "", tags: [] });
    const [tagInput, setTagInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let isActive = true;

        const loadVideo = async () => {
            if (!videoId) {
                setError("Video ID is missing.");
                setLoading(false);
                return;
            }

            try {
                const loginResponse = await checkAlreadyLogin();
                if (!loginResponse?.success) {
                    router.replace("/login");
                    return;
                }

                const response = await getVideoById(videoId);
                if (!response?.success || !response.data) {
                    throw new Error(response?.message || "Could not load this video.");
                }

                if (isActive) {
                    const videoData = response.data;
                    setVideo(videoData);
                    setForm({
                        title: videoData.title || "",
                        description: videoData.description || "",
                        category: videoData.category || categories[0],
                        tags: Array.isArray(videoData.tags) ? videoData.tags : [],
                    });
                }
            } catch (loadError) {
                if (isActive) setError(loadError?.message || "Could not load this video.");
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadVideo();
        return () => {
            isActive = false;
        };
    }, [router, videoId]);

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setSuccess("");
    };

    const addTag = (value) => {
        const tag = value.trim().replace(/,$/, "");
        if (!tag) return;
        if (form.tags.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase())) {
            setTagInput("");
            return;
        }
        updateField("tags", [...form.tags, tag]);
        setTagInput("");
    };

    const handleTagKeyDown = (event) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(tagInput);
        }
        if (event.key === "Backspace" && !tagInput && form.tags.length) {
            updateField("tags", form.tags.slice(0, -1));
        }
    };

    const saveDetails = async (event) => {
        event.preventDefault();
        if (!videoId || saving) return;

        const pendingTag = tagInput.trim().replace(/,$/, "");
        const tags = pendingTag && !form.tags.some((tag) => tag.toLowerCase() === pendingTag.toLowerCase())
            ? [...form.tags, pendingTag]
            : form.tags;
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            tags,
        };
        if (!payload.title || !payload.description || !payload.category) {
            setError("Add a title, description, and category before saving.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const isLoggedInResponse = await checkAlreadyLogin();
            if (!isLoggedInResponse?.success) {
                router.replace("/login");
                return;
            }
            const response = await editVideoDetails(videoId, payload);
            if (!response?.success) {
                throw new Error(response?.message || "Could not save video details.");
            }
            setVideo(response.data || video);
            setForm((current) => ({ ...current, tags }));
            setTagInput("");
            setSuccess("Video details saved.");
            router.replace(`/dashboard/videos/${videoId}`);
        } catch (saveError) {
            setError(saveError.response?.data?.message || saveError.message || "Could not save video details.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteVideo = async () => {
        if (!videoId || saving || deleting) return;
        const confirmed = window.confirm(`Delete "${video?.title || "this video"}" permanently?`);
        if (!confirmed) return;

        setDeleting(true);
        setError("");
        try {
            const response = await deleteVideo(videoId);
            if (!response?.success) {
                throw new Error(response?.message || "Could not delete this video.");
            }
            router.replace("/dashboard/videos");
        } catch (deleteError) {
            setError(deleteError?.message || "Could not delete this video.");
            setDeleting(false);
        }
    };

    if (loading) {
        return <main className={styles.page}><div className={styles.stateMessage}>Loading video details...</div></main>;
    }

    return (
        <main className={styles.page}>
            <div className={styles.pageWrap}>
                <Link href={videoId ? `/dashboard/videos/${videoId}` : "/dashboard/videos"} className={styles.backLink}>
                    <MdArrowBack />
                    Back to video
                </Link>

                <div className={styles.pageHeading}>
                    <div className={styles.headingIcon}><MdMovieEdit /></div>
                    <div>
                        <p className={styles.eyebrow}>Video studio</p>
                        <h1>Edit video details</h1>
                        <p className={styles.headingText}>Update how your video appears to viewers.</p>
                    </div>
                </div>

                {error && <p className={styles.errorMessage} role="alert">{error}</p>}
                {success && <p className={styles.successMessage} role="status"><MdCheck />{success}</p>}

                {!video && !error ? (
                    <div className={styles.stateMessage}>Video details are unavailable.</div>
                ) : video ? (
                    <form className={styles.editor} onSubmit={saveDetails}>
                        <section className={styles.formPanel} aria-label="Video details form">
                            <div className={styles.sectionHeading}>
                                <div>
                                    <h2>Details</h2>
                                    <p>Keep the title and description clear and easy to find.</p>
                                </div>
                                <span className={styles.requiredNote}>Required fields marked *</span>
                            </div>

                            <label className={styles.field}>
                                <span>Title <b>*</b></span>
                                <input
                                    value={form.title}
                                    onChange={(event) => updateField("title", event.target.value)}
                                    maxLength={100}
                                    placeholder="Add a title that describes your video"
                                    required
                                />
                                <small>{form.title.length}/100</small>
                            </label>

                            <label className={styles.field}>
                                <span>Description <b>*</b></span>
                                <textarea
                                    value={form.description}
                                    onChange={(event) => updateField("description", event.target.value)}
                                    maxLength={5000}
                                    rows={7}
                                    placeholder="Tell viewers what this video is about"
                                    required
                                />
                                <small>{form.description.length}/5000</small>
                            </label>

                            <label className={styles.field}>
                                <span>Category <b>*</b></span>
                                <select
                                    value={form.category}
                                    onChange={(event) => updateField("category", event.target.value)}
                                    required
                                >
                                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                                </select>
                            </label>

                            <div className={styles.field}>
                                <label htmlFor="video-tags">Tags</label>
                                <div className={styles.tagInputWrap}>
                                    <MdSell />
                                    <input
                                        id="video-tags"
                                        value={tagInput}
                                        onChange={(event) => setTagInput(event.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        onBlur={() => addTag(tagInput)}
                                        placeholder="Type a tag and press Enter"
                                    />
                                </div>
                                {form.tags.length > 0 && (
                                    <div className={styles.tagList} aria-label="Video tags">
                                        {form.tags.map((tag, index) => (
                                            <span className={styles.tag} key={`${tag}-${index}`}>
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => updateField("tags", form.tags.filter((_, tagIndex) => tagIndex !== index))}
                                                    aria-label={`Remove ${tag} tag`}
                                                >
                                                    <MdClose />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <small className={styles.fieldHint}>Press Enter or comma after each tag.</small>
                            </div>
                        </section>

                        <aside className={styles.previewPanel} aria-label="Video preview">
                            <div className={styles.previewHeading}>
                                <span>Preview</span>
                                <span className={styles.previewStatus}>Details only</span>
                            </div>
                            <div className={styles.thumbnail}>
                                {video.thumbnailUrl ? (
                                    <img src={video.thumbnailUrl} alt="Current video thumbnail" />
                                ) : <MdMovieEdit />}
                                {video.duration != null && <span>{Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, "0")}</span>}
                            </div>
                            <div className={styles.previewDetails}>
                                <h2>{form.title || "Video title"}</h2>
                                <p>{video.channel?.name || video.channel?.channelName || "Your channel"}</p>
                                <p>{Number(video.views || 0).toLocaleString()} views</p>
                            </div>
                            <div className={styles.previewDescription}>
                                <strong>Description</strong>
                                <p>{form.description || "Your description will appear here."}</p>
                            </div>
                        </aside>

                        <div className={styles.formActionsSubmit}>
                            <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={handleDeleteVideo}
                                disabled={saving || deleting}
                            >
                                {deleting ? "Deleting..." : "Delete video"}
                            </button>
                        </div>
                        <div className={styles.formActions}>
                            <Link href={videoId ? `/dashboard/videos/${videoId}` : "/dashboard/videos"} className={styles.cancelButton}>Cancel</Link>
                            <button type="submit" className={styles.saveButton} disabled={saving}>
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                ) : null}
            </div>
        </main>
    );
};

export default EditPage;
