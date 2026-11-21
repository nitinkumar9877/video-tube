// "use client";

// import { useMemo, useState } from "react";
// import Link from "next/link";
// import { MdClose, MdMoreVert, MdSearch, MdHistory } from "react-icons/md";
// import styles from "@/components/styleSheets/history.module.css";

// const initialHistory = [
//     {
//         id: 1,
//         title: "A Calm Journey Through the Mountain Valley",
//         channel: "Northbound",
//         views: "1.2M views",
//         time: "2 hours ago",
//         date: "Today",
//         duration: "18:24",
//         progress: 68,
//         accent: "#1d4ed8",
//     },
//     {
//         id: 2,
//         title: "Building a Modern Design System in React",
//         channel: "Design with Code",
//         views: "842K views",
//         time: "4 hours ago",
//         date: "Today",
//         duration: "24:08",
//         progress: 31,
//         accent: "#ef4444",
//     },
//     {
//         id: 3,
//         title: "Three Simple Meals for Busy Weeknights",
//         channel: "Kitchen Notes",
//         views: "326K views",
//         time: "Yesterday",
//         date: "Yesterday",
//         duration: "12:41",
//         progress: 100,
//         accent: "#ea580c",
//     },
//     {
//         id: 4,
//         title: "JavaScript Concepts Explained Visually",
//         channel: "Code Explained",
//         views: "680K views",
//         time: "Yesterday",
//         date: "Yesterday",
//         duration: "16:52",
//         progress: 44,
//         accent: "#0891b2",
//     },
//     {
//         id: 5,
//         title: "The Most Beautiful Train Journeys",
//         channel: "Outside the Map",
//         views: "2.1M views",
//         time: "2 days ago",
//         date: "November 17",
//         duration: "21:15",
//         progress: 72,
//         accent: "#059669",
//     },
// ];

// export default function HistoryPage() {
//     const [history, setHistory] = useState(initialHistory);
//     const [query, setQuery] = useState("");

//     const filteredHistory = useMemo(() => {
//         const normalizedQuery = query.trim().toLowerCase();
//         if (!normalizedQuery) return history;

//         return history.filter((video) =>
//             `${video.title} ${video.channel}`.toLowerCase().includes(normalizedQuery)
//         );
//     }, [history, query]);

//     const removeVideo = (videoId) => {
//         setHistory((current) => current.filter((video) => video.id !== videoId));
//     };

//     const groupedHistory = filteredHistory.reduce((groups, video) => {
//         if (!groups[video.date]) groups[video.date] = [];
//         groups[video.date].push(video);
//         return groups;
//     }, {});

//     return (
//         // <main className={styles.page}>
//         //     <h1>This is static data</h1>
//         //     <h1>Api binding is pending inside these</h1>
//             {/* <div className={styles.pageWrap}>
//                 <header className={styles.pageHeader}>
//                     <div>
//                         <p className={styles.eyebrow}>Activity</p>
//                         <h1>Watch history</h1>
//                     </div>
//                     {history.length > 0 && (
//                         <button
//                             type="button"
//                             className={styles.clearButton}
//                             onClick={() => setHistory([])}
//                         >
//                             Clear all watch history
//                         </button>
//                     )}
//                 </header>

//                 <div className={styles.layout}>
//                     <section className={styles.historyContent}>
//                         {Object.keys(groupedHistory).length > 0 ? (
//                             Object.entries(groupedHistory).map(([date, videos]) => (
//                                 <section className={styles.historyGroup} key={date}>
//                                     <h2>{date}</h2>
//                                     <div className={styles.videoList}>
//                                         {videos.map((video) => (
//                                             <article className={styles.historyItem} key={video.id}>
//                                                 <Link
//                                                     href="/"
//                                                     className={styles.thumbnail}
//                                                     style={{ "--thumbnail-accent": video.accent }}
//                                                     aria-label={`Watch ${video.title}`}
//                                                 >
//                                                     <div className={styles.thumbnailPattern} />
//                                                     <span className={styles.duration}>{video.duration}</span>
//                                                     <span
//                                                         className={styles.progressTrack}
//                                                         aria-label={`${video.progress}% watched`}
//                                                     >
//                                                         <span style={{ width: `${video.progress}%` }} />
//                                                     </span>
//                                                 </Link>

//                                                 <div className={styles.videoDetails}>
//                                                     <Link href="/" className={styles.videoTitle}>{video.title}</Link>
//                                                     <p>
//                                                         <span>{video.channel}</span>
//                                                         <span className={styles.dot}>•</span>
//                                                         <span>{video.views}</span>
//                                                     </p>
//                                                     <span className={styles.watchedTime}>Watched {video.time}</span>
//                                                 </div>

//                                                 <div className={styles.itemActions}>
//                                                     <button
//                                                         type="button"
//                                                         className={styles.iconButton}
//                                                         aria-label="More options"
//                                                     >
//                                                         <MdMoreVert />
//                                                     </button>
//                                                     <button
//                                                         type="button"
//                                                         className={styles.removeButton}
//                                                         aria-label={`Remove ${video.title} from history`}
//                                                         onClick={() => removeVideo(video.id)}
//                                                     >
//                                                         <MdClose />
//                                                     </button>
//                                                 </div>
//                                             </article>
//                                         ))}
//                                     </div>
//                                 </section>
//                             ))
//                         ) : (
//                             <div className={styles.emptyState}>
//                                 <MdHistory />
//                                 <h2>{history.length === 0 ? "Watch history is empty" : "No matching videos"}</h2>
//                                 <p>{history.length === 0 ? "Videos you watch will appear here." : "Try another title or channel name."}</p>
//                             </div>
//                         )}
//                     </section>

//                     <aside className={styles.historySidebar}>
//                         <label className={styles.searchBox}>
//                             <MdSearch />
//                             <input
//                                 type="search"
//                                 value={query}
//                                 onChange={(event) => setQuery(event.target.value)}
//                                 placeholder="Search watch history"
//                                 aria-label="Search watch history"
//                             />
//                         </label>

//                         <div className={styles.summaryCard}>
//                             <strong>{history.length}</strong>
//                             <span>videos in your history</span>
//                         </div>

//                         <p className={styles.privacyText}>
//                             Your watch history helps personalize the videos and recommendations you see.
//                         </p>
//                     </aside>
//                 </div>
//             </div> */}
//         // </main>
//     );
// }



import React from 'react'

const HistoryPage = () => {
    return (
        <div className="flex min-h-[calc(100vh-20vh)] max-h-[calc(100vh-20vh)] items-center justify-center bg-gray-100">

            This is the History page. You can find your history here.
        </div>
    )
}

export default HistoryPage
