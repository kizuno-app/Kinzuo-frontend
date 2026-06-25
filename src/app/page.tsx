"use client";
import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedService } from "@/services/feed.service";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import Link from "next/link";

import PostCard from "@/components/PostCard";
import WelcomePage from "./welcome/page";

const PostSkeleton = () => (
  <div className="animate-pulse" style={{ background: "#171717", borderRadius: "16px", padding: "16px", marginBottom: "16px", border: "1px solid #262626" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#333" }} />
      <div>
        <div style={{ width: "120px", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "6px" }} />
        <div style={{ width: "80px", height: "12px", background: "#333", borderRadius: "4px" }} />
      </div>
    </div>
    <div style={{ width: "100%", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "8px" }} />
    <div style={{ width: "80%", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "16px" }} />
    <div style={{ height: "200px", width: "100%", background: "#333", borderRadius: "12px", marginBottom: "16px" }} />
    <div style={{ display: "flex", gap: "16px" }}>
      <div style={{ width: "60px", height: "32px", background: "#333", borderRadius: "16px" }} />
      <div style={{ width: "60px", height: "32px", background: "#333", borderRadius: "16px" }} />
    </div>
  </div>
);
export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { openDrawer, unreadCount } = useNotificationStore();
  const queryClient = useQueryClient();

  if (!isAuthenticated) {
    return <WelcomePage />;
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: feedService.getHomeFeed,
    getNextPageParam: (lastPage, allPages) => {
      const postsCount = allPages.reduce((sum, page) => sum + (page.posts?.length || 0), 0);
      const lastPagePosts = lastPage.posts || [];
      if (lastPagePosts.length < 10) return undefined;
      const seenIds = allPages.flatMap(page => (page.posts || []).map((p: any) => p.id));
      return { offset: postsCount, seenIds };
    },
    initialPageParam: { offset: 0, seenIds: [] },
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Extract and deduplicate posts in-memory
  const allPosts = data?.pages.flatMap((page) => page.posts || []) || [];
  const uniquePosts = allPosts.filter((post, index, self) => 
    self.findIndex((p) => p.id === post.id) === index
  );

  const [debugScroll, setDebugScroll] = useState({ scrollY: 0, saved: "" });

  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof window !== "undefined") {
        let scrollYVal = window.scrollY;
        let scrollingElInfo = "none";
        
        // Scan for elements with scrollTop > 0
        const elements = Array.from(document.querySelectorAll('*'));
        for (const el of elements) {
          if (el.scrollTop > 0) {
            scrollYVal = el.scrollTop;
            scrollingElInfo = `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''}${el.id ? '#' + el.id : ''}`;
            console.log("[ScrollDebug] Scroll element:", scrollingElInfo, "scrollTop:", el.scrollTop);
            break;
          }
        }

        setDebugScroll({
          scrollY: scrollYVal,
          saved: (sessionStorage.getItem("home-feed-scroll-position") || "null") + ` (${scrollingElInfo})`
        });
      }
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Disable browser automatic scroll restoration on mount, restore on unmount
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      const original = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = original;
      };
    }
  }, []);

  // Scroll preservation and restoration
  useEffect(() => {
    console.log("[ScrollRestore] Effect triggered. isLoading:", isLoading, "uniquePosts:", uniquePosts.length);
    if (!isLoading && uniquePosts.length > 0) {
      const savedPosition = sessionStorage.getItem("home-feed-scroll-position");
      console.log("[ScrollRestore] Saved position in storage:", savedPosition);
      if (savedPosition) {
        const targetScroll = parseInt(savedPosition, 10);
        if (targetScroll > 0) {
          const restoreScroll = () => {
            console.log("[ScrollRestore] Restoring scroll to:", targetScroll, "current actual scrollY:", window.scrollY, "document height:", document.documentElement.scrollHeight);
            
            // Restore window scroll
            window.scrollTo({
              top: targetScroll,
              behavior: "instant" as any
            });

            // Also restore scroll on documentElement and body in case either is the scroll container
            if (document.documentElement) {
              document.documentElement.scrollTop = targetScroll;
            }
            if (document.body) {
              document.body.scrollTop = targetScroll;
            }
          };

          // Attempt restoration across multiple layout frames to handle dynamic image loading / DOM rendering
          restoreScroll();
          const frameId = requestAnimationFrame(restoreScroll);
          const timerId = setTimeout(restoreScroll, 50);
          const longTimerId = setTimeout(restoreScroll, 150);
          const extraLongTimerId = setTimeout(restoreScroll, 300);

          return () => {
            console.log("[ScrollRestore] Cleaning up restoration timers");
            cancelAnimationFrame(frameId);
            clearTimeout(timerId);
            clearTimeout(longTimerId);
            clearTimeout(extraLongTimerId);
          };
        }
      }
    }
  }, [isLoading, uniquePosts.length]);

  useEffect(() => {
    let timeoutId: any;
    const handleScroll = () => {
      const currentScroll = Math.ceil(
        Math.max(
          window.scrollY || 0,
          document.documentElement?.scrollTop || 0,
          document.body?.scrollTop || 0
        )
      );
      console.log("[ScrollPreserve] handleScroll. scrollY:", currentScroll);
      
      setDebugScroll({
        scrollY: currentScroll,
        saved: sessionStorage.getItem("home-feed-scroll-position") || "null"
      });
      
      if (currentScroll > 0) {
        // Cancel any pending top-scroll clears and update position
        clearTimeout(timeoutId);
        sessionStorage.setItem("home-feed-scroll-position", currentScroll.toString());
      } else if (currentScroll === 0) {
        // If they scrolled to the top, wait 300ms before clearing the saved position.
        // If they navigate away, the component unmounts and cancels this timeout,
        // preserving the last positive scroll position!
        clearTimeout(timeoutId);
        console.log("[ScrollPreserve] scrollY is 0. Scheduling clear in 300ms...");
        timeoutId = setTimeout(() => {
          console.log("[ScrollPreserve] Timeout fired. Clearing home-feed-scroll-position");
          sessionStorage.removeItem("home-feed-scroll-position");
        }, 300);
      }
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      console.log("[ScrollPreserve] Cleanup. Removing scroll listener. Timeout ID:", timeoutId);
      window.removeEventListener("scroll", handleScroll, { capture: true });
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #262626", marginBottom: "16px", position: "sticky", top: 0, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", margin: 0, marginBottom: "4px" }}>
              Hey, {user?.firstName || 'User'} 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#a1a1aa", margin: 0 }}>Find your people</p>
          </div>
          <div className="md:hidden">
            <button 
              onClick={() => openDrawer()}
              style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1f1f22", border: "1px solid #262626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%", border: "2px solid #1f1f22" }} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {isLoading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}
        
        {isError && (
          <div style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>Failed to load feed</div>
        )}

        {uniquePosts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        <div ref={observerRef} style={{ height: "10px" }} />

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{
              width: "100%", padding: "12px", background: "#171717", border: "1px solid #262626",
              borderRadius: "12px", color: "#a1a1aa", cursor: "pointer", marginBottom: "20px"
            }}
          >
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </button>
        )}
      </div>

      {/* Floating Scroll Debug Panel */}
      {process.env.NODE_ENV === "development" && (
        <div style={{
          position: "fixed", bottom: "80px", right: "20px", background: "rgba(0,0,0,0.85)",
          border: "1px solid #333", borderRadius: "10px", padding: "10px", zIndex: 9999,
          color: "#fff", fontSize: "12px", fontFamily: "monospace", display: "flex", flexDirection: "column", gap: "4px"
        }}>
          <div>scrollY: {debugScroll.scrollY}px</div>
          <div>savedScroll: {debugScroll.saved}px</div>
        </div>
      )}
    </>
  );
}
