"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    MdArrowBack,
    MdCheckCircle,
    MdErrorOutline,
    MdVideoCall,
} from "react-icons/md";
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

    const createChannel = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            const response = await api.post("/api/auth/channels", form);
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
            <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 md:px-8 ">
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
                            <div className="-mt-10 grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-violet-100 text-2xl font-bold text-violet-700">
                                {channel.channelName?.charAt(0).toUpperCase() || "C"}
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
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/user"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                    <MdArrowBack />
                    Back to profile
                </Link>

                <form
                    onSubmit={createChannel}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                >
                    <div className="mb-7">
                        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-violet-100 text-2xl text-violet-700">
                            <MdVideoCall />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Create your channel</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Set up your channel name and let viewers get to know you.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <MdErrorOutline className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid gap-5">
                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                            Channel name
                            <input
                                name="channelName"
                                value={form.channelName}
                                onChange={updateField}
                                required
                                minLength={3}
                                maxLength={100}
                                placeholder="Your channel name"
                                className="h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                            Channel handle
                            <div className="flex h-12 items-center rounded-xl border border-slate-200 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
                                <span className="pl-4 text-slate-400">@</span>
                                <input
                                    name="channelHandle"
                                    value={form.channelHandle}
                                    onChange={updateField}
                                    required
                                    pattern="[a-z0-9._-]+"
                                    placeholder="channelhandle"
                                    className="h-full min-w-0 flex-1 rounded-r-xl border-0 px-2 outline-none"
                                />
                            </div>
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                            Category
                            <select
                                name="category"
                                value={form.category}
                                onChange={updateField}
                                required
                                className="h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            >
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

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                            Description
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={updateField}
                                required
                                maxLength={1000}
                                rows={5}
                                placeholder="Tell viewers what your channel is about"
                                className="resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />
                        </label>
                    </div>

                    <div className="mt-7 flex justify-end gap-3">
                        <Link
                            href="/user"
                            className="inline-flex h-11 items-center rounded-full px-5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-11 items-center rounded-full bg-violet-600 px-6 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                        >
                            {submitting ? "Creating..." : "Create channel"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
