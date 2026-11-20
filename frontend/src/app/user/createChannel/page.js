"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdCameraAlt, MdCheckCircle, MdErrorOutline, MdPerson, MdVideoCall, } from "react-icons/md";
import { checkAlreadyLogin } from "@/services/AuthUser.js";
import { getMyChannel } from "@/services/channel.services.js";
import api from "@/services/api";
import styles from "../../../components/styleSheets/createChannel.module.css";

const initialForm = {
    channelName: "",
    channelHandle: "",
    description: "",
    category: "",
};

export default function CreateChannelPage() {
    const [form, setForm] = useState(initialForm);
    const [channelLogo, setChannelLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    useEffect(() => {
        const checkLoginAndChannel = async () => {
            try {
                const response = await checkAlreadyLogin();
                if (!response?.success) {
                    console.error("User is not logged in:", response?.message || "Unknown error");
                    router.replace("/login");
                    return;
                }

                const channelResponse = await getMyChannel();
                if (!channelResponse?.success) {
                    console.error("Failed to fetch channel data:", channelResponse?.message || "Unknown error");
                    setChannel(null);
                    setError(channelResponse?.message || "Unable to check your channel.");
                } else if (channelResponse.channel) {
                    setChannel(channelResponse.channel);
                    router.replace("/user/my-channel");
                }
            } catch (error) {
                console.error("Error checking login status:", error);
                setError("Unable to check your channel. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        checkLoginAndChannel();
    }, [router]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
            ...(name === "channelName" && !current.channelHandle
                ? {
                    channelHandle: value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                }
                : {}),
        }));
    };

    const updateLogo = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Choose an image smaller than 5 MB.");
            event.target.value = "";
            return;
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("Please choose a JPG, PNG, or WebP image.");
            event.target.value = "";
            return;
        }

        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setChannelLogo(file);
        setLogoPreview(URL.createObjectURL(file));
        setError("");
    };

    const createChannel = async (event) => {
        event.preventDefault();

        if (!channelLogo) {
            setError("Please add a channel logo.");
            return;
        }

        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));
            formData.append("Image", channelLogo);

            const response = await api.post("/api/auth/channels", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setChannel(response.data?.channel || null);
            setMessage("Your channel has been created.");
            router.replace("/user/my-channel");
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                requestError.response?.data?.message ||
                "Unable to create your channel. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 md:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                    Loading channel settings...
                </div>
            </div>
        );
    }

    return (
        <main className={styles.channelSettingsPage}>
            <div className={styles.pageWrap}>
                <Link href="/user" className={styles.backLink}>
                    <MdArrowBack />
                    Back to profile
                </Link>

                <form onSubmit={createChannel} className={styles.channelForm}>
                    <header className={styles.formHeader}>
                        <div className={styles.headerIcon}><MdVideoCall /></div>
                        <div>
                            <h1>Create your channel</h1>
                            <p>Set up your channel and help viewers get to know you.</p>
                        </div>
                    </header>

                    {error && (
                        <div className={styles.errorMessage}>
                            <MdErrorOutline />
                            <span>{error}</span>
                        </div>
                    )}

                    <section className={styles.logoSection}>
                        <label className={styles.logoPicker} htmlFor="channel-logo">
                            <span className={styles.avatarPreview}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Channel logo preview" />
                                ) : (
                                    <MdPerson />
                                )}
                            </span>
                            <span className={styles.cameraButton} aria-hidden="true">
                                <MdCameraAlt />
                            </span>
                        </label>
                        <div className={styles.logoCopy}>
                            <strong>Channel logo</strong>
                            <span>JPG, PNG or WebP. We recommend a square image.</span>
                            <label htmlFor="channel-logo" className={styles.uploadButton}>Choose image</label>
                            <input
                                id="channel-logo"
                                name="channelLogo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={updateLogo}
                                className="sr-only"
                            />
                        </div>
                    </section>

                    <div className={styles.formGrid}>
                        <label className={styles.field}>
                            <span>Channel name</span>
                            <input
                                name="channelName"
                                value={form.channelName}
                                onChange={updateField}
                                required
                                minLength={3}
                                maxLength={100}
                                placeholder="Your channel name"
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Channel handle</span>
                            <div className={styles.handleInput}>
                                <b>@</b>
                                <input
                                    name="channelHandle"
                                    value={form.channelHandle}
                                    onChange={updateField}
                                    required
                                    pattern="[a-z0-9-]+"
                                    placeholder="channelhandle"
                                />
                            </div>
                        </label>

                        <label className={styles.field}>
                            <span>Category</span>
                            <select name="category" value={form.category} onChange={updateField} required>
                                <option value="">Select a category</option>
                                <option value="Education">Education</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Music">Music</option>
                                <option value="News">News</option>
                                <option value="Technology">Technology</option>
                                <option value="Lifestyle">Lifestyle</option>
                            </select>
                        </label>

                        <label className={styles.field}>
                            <span>Description</span>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={updateField}
                                required
                                maxLength={1000}
                                rows={5}
                                placeholder="Tell viewers what your channel is about"
                            />
                            <small>{form.description.length}/1000</small>
                        </label>
                    </div>

                    <div className={styles.formActions}>
                        <Link href="/user" className={styles.cancelButton}>Cancel</Link>
                        <button type="submit" disabled={submitting} className={styles.submitButton}>
                            {submitting ? "Creating..." : "Create channel"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}