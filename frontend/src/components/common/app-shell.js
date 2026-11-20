"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdMenu, MdMic, MdSearch, MdVideoCall, MdNotificationsNone, MdHome, MdSubscriptions, MdHistory, MdPlaylistPlay, MdWatchLater, MdThumbUpOffAlt, MdLocalFireDepartment, MdMusicNote, MdSportsEsports, MdNewspaper, MdSettings, MdOutlinedFlag, MdHelpOutline, } from "react-icons/md";
import { FaCircleUser } from "react-icons/fa6";
import styles from "../styleSheets/app-shell.module.css";
import logo from "@/assets/playTube.webp";
import { useEffect, useRef, useState } from "react";
import { checkAlreadyLogin, logoutUser } from "@/services/AuthUser";
import api from "@/services/api";

const primaryLinks = [
  { label: "Home", href: "/", icon: MdHome },
  { label: "Subscribe", href: "/user/subscribe", icon: MdSubscriptions },
  { label: "History", href: "/user/history", icon: MdHistory },
];

const libraryLinks = [
  // { label: "Playlists", href: "/playlists", icon: MdPlaylistPlay },
  // { label: "Watch later", href: "/watch-later", icon: MdWatchLater },
  { label: "Liked videos", href: "/user/liked", icon: MdThumbUpOffAlt },
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const closeMenu = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const closeMenuOnEscape = (event) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenuOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, []);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await checkAlreadyLogin();
  //       if (!response?.success) {
  //         setIsLoggedIn(false);
  //         return;
  //       }
  //       const data = response.data;
  //       console.log("Data from checkAlreadyLogin API :: ", data);
  //       if (response?.success) {
  //         setIsLoggedIn(true);
  //       }
  //     } catch {
  //       setIsLoggedIn(false);
  //     }
  //   };
  //   fetchUser();
  // },[]);


  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await checkAlreadyLogin();
        console.log("----------------------------------------Start-------------------------------------------------");
        console.log("Response from checkAlreadyLogin API :: ", response);
        console.log("----------------------------------------End-------------------------------------------------");

        if (!isMounted) return;

        if (response?.success) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }

      } catch (error) {
        if (!isMounted) return;

        console.log("Fetch user error:", error);
        setIsLoggedIn(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };

  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
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

          {isLoggedIn ? (
            <div className={styles.profileMenuWrap} ref={profileMenuRef}>
              <button
                type="button"
                className={styles.profileTrigger}
                aria-label="Open user menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                <span className={styles.profileIconLogin}>N</span>
              </button>

              <div className={`${styles.profileMenu} ${profileMenuOpen ? styles.profileMenuOpen : ""}`}>
                <Link href="/user" className={styles.loginButton} onClick={() => setProfileMenuOpen(false)}>
                  Profile
                </Link>
                <button
                  type="button"
                  className={styles.signupButton}
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.profileMenuWrap} ref={profileMenuRef}>
              <button
                type="button"
                className={styles.profileTrigger}
                aria-label="Open account menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                <FaCircleUser className={styles.profileIconNoLogin} />
              </button>

              <div className={`${styles.profileMenu} ${profileMenuOpen ? styles.profileMenuOpen : ""}`}>
                <Link href="/login" className={styles.loginButton} onClick={() => setProfileMenuOpen(false)}>
                  Log in
                </Link>
                <Link href="/register-account" className={styles.signupButton} onClick={() => setProfileMenuOpen(false)}>
                  Sign up
                </Link>
              </div>
            </div>
          )}
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
