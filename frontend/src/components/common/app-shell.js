"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdMenu,
  MdMic,
  MdSearch,
  MdVideoCall,
  MdNotificationsNone,
  MdHome,
  MdSubscriptions,
  MdHistory,
  MdPlaylistPlay,
  MdWatchLater,
  MdThumbUpOffAlt,
  MdLocalFireDepartment,
  MdMusicNote,
  MdSportsEsports,
  MdNewspaper,
  MdSettings,
  MdOutlinedFlag,
  MdHelpOutline,
} from "react-icons/md";
import styles from "../styleSheets/app-shell.module.css";
import logo from "@/assets/playTube.webp";

const primaryLinks = [
  { label: "Home", href: "/", icon: MdHome },
  { label: "Subscriptions", href: "/subscriptions", icon: MdSubscriptions },
  { label: "History", href: "/history", icon: MdHistory },
];

const libraryLinks = [
  // { label: "Playlists", href: "/playlists", icon: MdPlaylistPlay },
  // { label: "Watch later", href: "/watch-later", icon: MdWatchLater },
  { label: "Liked videos", href: "/liked", icon: MdThumbUpOffAlt },
];

const exploreLinks = [
  { label: "Trending", href: "/trending", icon: MdLocalFireDepartment },
  { label: "Music", href: "/music", icon: MdMusicNote },
  { label: "Gaming", href: "/gaming", icon: MdSportsEsports },
  { label: "News", href: "/news", icon: MdNewspaper },
];

function SidebarLink({ item, pathname }) {
  const Icon = item.icon;
  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`${styles.sidebarLink} ${active ? styles.sidebarActive : ""}`}
    >
      <Icon />
      <span>{item.label}</span>
    </Link>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register-account");

  if (isAuthPage) {
    return children;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button type="button" className={styles.iconButton} aria-label="Open menu">
            <MdMenu />
          </button>
          <Link href="/" className={styles.brand} aria-label="PlayTube home">
            <Image src={logo} alt="" width={38} height={38} priority />
            <span>PlayTube</span>
          </Link>
        </div>

        <div className={styles.searchArea}>
          <div className={styles.searchBox}>
            <input type="search" aria-label="Search" placeholder="Search" />
            <button type="button" aria-label="Search">
              <MdSearch />
            </button>
          </div>
          <button type="button" className={styles.micButton} aria-label="Search with voice">
            <MdMic />
          </button>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.iconButton} aria-label="Create">
            <MdVideoCall />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Notifications">
            <MdNotificationsNone />
          </button>
          <Link href="/user" className={styles.profile} aria-label="User profile">
            N
          </Link>
        </div>
      </header>

      <aside className={styles.sidebar}>
        <nav className={styles.sidebarNav} aria-label="Main navigation">
          <div className={styles.sidebarSection}>
            {primaryLinks.map((item) => (
              <SidebarLink item={item} pathname={pathname} key={item.label} />
            ))}
          </div>

          <div className={styles.sidebarSection}>
            <p className={styles.sectionTitle}>You</p>
            {libraryLinks.map((item) => (
              <SidebarLink item={item} pathname={pathname} key={item.label} />
            ))}
          </div>

          {/* <div className={styles.sidebarSection}>
            <p className={styles.sectionTitle}>Explore</p>
            {exploreLinks.map((item) => (
              <SidebarLink item={item} pathname={pathname} key={item.label} />
            ))}
          </div> */}

          <div className={styles.sidebarSection}>
            <SidebarLink
              item={{ label: "Settings", href: "/settings", icon: MdSettings }}
              pathname={pathname}
            />
            <SidebarLink
              item={{ label: "Report history", href: "/report-history", icon: MdOutlinedFlag }}
              pathname={pathname}
            />
            <SidebarLink
              item={{ label: "Help", href: "/help", icon: MdHelpOutline }}
              pathname={pathname}
            />
          </div>
        </nav>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
