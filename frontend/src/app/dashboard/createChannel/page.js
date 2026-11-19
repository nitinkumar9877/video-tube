"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MdArrowBack, MdCameraAlt, MdCheckCircle, MdErrorOutline, MdPerson, MdVideoCall, } from "react-icons/md";
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

    useEffect(() => {
        api
            .get("/api/auth/channels/me")
            .then((response) => setChannel(response.data?.channel || null))
            .catch(() => setChannel(null))
            .finally(() => setLoading(false));
    }, []);

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

    useEffect(() => () => {
        if (logoPreview) URL.revokeObjectURL(logoPreview);
    }, [logoPreview]);

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

    if (channel) {
        return (
            <div className={`${styles.channelSettingsPage} min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 md:px-8`}>
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/user"
                        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        <MdArrowBack />
                        Back to profile
                    </Link>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-36 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500" />
                        <div className="flex flex-col items-start gap-5 px-6 pb-7 sm:flex-row sm:items-end">
                            <div className="-mt-10 grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-violet-100 text-2xl font-bold text-violet-700">
                                {channel.channelLogo ? (
                                    <img src={channel.channelLogo} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    channel.channelName?.charAt(0).toUpperCase() || "C"
                                )}
                            </div>
                            <div className="min-w-0 pt-2 sm:pb-1">
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {channel.channelName}
                                </h1>
                                <p className="text-sm text-slate-500">@{channel.channelHandle}</p>
                            </div>
                            <Link
                                href="/dashboard/upload"
                                className="ml-0 inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-bold text-white sm:ml-auto"
                            >
                                <MdVideoCall />
                                Upload video
                            </Link>
                        </div>

                        {message && (
                            <div className="mx-6 mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                <MdCheckCircle />
                                {message}
                            </div>
                        )}

                        <div className="grid grid-cols-3 border-t border-slate-100">
                            <div className="px-5 py-5 text-center">
                                <strong className="block text-xl text-slate-900">
                                    {channel.subscribersCount || 0}
                                </strong>
                                <span className="text-xs text-slate-500">Subscribers</span>
                            </div>
                            <div className="border-x border-slate-100 px-5 py-5 text-center">
                                <strong className="block text-xl text-slate-900">
                                    {channel.totalVideos || 0}
                                </strong>
                                <span className="text-xs text-slate-500">Videos</span>
                            </div>
                            <div className="px-5 py-5 text-center">
                                <strong className="block text-xl text-slate-900">
                                    {channel.totalViews || 0}
                                </strong>
                                <span className="text-xs text-slate-500">Views</span>
                            </div>
                        </div>
                    </section>
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
                                    pattern="[a-z0-9._-]+"
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