"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";

export default function PublicSharePage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["public-post", token],
    queryFn: () => postService.getPublicPost(token),
    enabled: !!token,
  });

  // Redirect to full post detail if user is logged in
  useEffect(() => {
    if (mounted && isAuthenticated && post?.id) {
      router.replace(`/user/post/${post.id}`);
    }
  }, [isAuthenticated, post, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0a0a0a", color: "#a1a1aa" }}>
        <div className="animate-pulse" style={{ fontSize: "16px", fontWeight: 600 }}>Loading post...</div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0a0a0a", color: "#ef4444", gap: "16px", padding: "20px" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div style={{ fontSize: "18px", fontWeight: 700 }}>Post not found or access restricted</div>
        <Link href="/login" style={{ color: "#cca43b", textDecoration: "none", fontWeight: 600 }} className="hover:underline">Back to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#0a0a0a", color: "#fafafa" }}>
      <div style={{ display: "flex", width: "100%", maxWidth: "1200px", justifyContent: "space-between", padding: "0 16px" }}>
        
        {/* Left column - Kizuno brand logo */}
        <aside style={{ width: "240px", height: "100vh", position: "sticky", top: 0, padding: "24px 24px 24px 0" }} className="hidden md:flex flex-col shrink-0">
          <div style={{ padding: "0 16px 32px" }}>
            <span style={{ 
              background: "linear-gradient(90deg, #4f46e5 0%, #d4af37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "26px", 
              fontWeight: 900, 
              letterSpacing: "-1px" 
            }}>
              KIZUNO
            </span>
          </div>
          <Link href="/login" style={{
            display: "flex", alignItems: "center", gap: "12px",
            width: "100%", padding: "12px 16px", background: "transparent",
            border: "1.5px solid #3f3f46", borderRadius: "24px", color: "#fafafa",
            fontSize: "16px", fontWeight: 700, cursor: "pointer", textDecoration: "none",
            textAlign: "center", justifyContent: "center", transition: "background 0.2s"
          }} className="hover:bg-[#171717]">
            Log In
          </Link>
        </aside>

        {/* Center column - ONLY the post details */}
        <main style={{ flex: 1, maxWidth: "600px", borderLeft: "1px solid #262626", borderRight: "1px solid #262626", minHeight: "100vh", paddingBottom: "100px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", position: "sticky", top: 0, background: "rgba(10,10,10,0.8)", backdropFilter: "blur(12px)", zIndex: 10, borderBottom: "1px solid #262626" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#fafafa", margin: 0 }}>Shared Post</h1>
          </div>

          <div style={{ padding: "16px" }}>
            {/* Render the post itself using our PostCard */}
            <PostCard post={post} />

            {/* Prompt banner to login/signup to view comments/engage */}
            <div style={{
              background: "linear-gradient(135deg, #1f1f22 0%, #171717 100%)",
              border: "1px solid #262626",
              borderRadius: "24px",
              padding: "24px",
              textAlign: "center",
              marginTop: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
            }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Want to join the conversation?</h2>
              <p style={{ fontSize: "14px", color: "#a1a1aa", marginBottom: "20px", lineHeight: 1.5 }}>
                Log in or sign up on Kizuno to see comments, reply, like, or quote this post.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <Link href="/login" style={{
                  background: "#4f46e5", color: "#ffffff", fontWeight: 700, fontSize: "15px",
                  padding: "10px 24px", borderRadius: "24px", textDecoration: "none",
                  transition: "transform 0.15s"
                }} className="hover:scale-102">
                  Log In
                </Link>
                <Link href="/register" style={{
                  background: "transparent", color: "#fff", border: "1.5px solid #3f3f46",
                  fontWeight: 700, fontSize: "15px", padding: "10px 24px", borderRadius: "24px",
                  textDecoration: "none", transition: "background 0.2s"
                }} className="hover:bg-[#262626]">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Right column - signup CTA card */}
        <aside style={{ width: "320px", padding: "24px 0 24px 24px" }} className="hidden lg:block">
          <div style={{
            background: "#171717",
            border: "1px solid #262626",
            borderRadius: "24px",
            padding: "24px",
            position: "sticky",
            top: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fafafa" }}>New to Kizuno?</h2>
            <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.5 }}>
              Sign up now to get your own personalized timeline, connect with peers, and share your thoughts!
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
              <Link href="/register" style={{
                background: "#fafafa", color: "#111", fontWeight: 700, fontSize: "14px",
                padding: "12px", borderRadius: "24px", textAlign: "center", textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                Create account
              </Link>
              <Link href="/login" style={{
                background: "transparent", color: "#fafafa", border: "1.5px solid #3f3f46",
                fontWeight: 700, fontSize: "14px", padding: "12px", borderRadius: "24px",
                textAlign: "center", textDecoration: "none"
              }} className="hover:bg-[#262626]">
                Log in
              </Link>
            </div>
          </div>
        </aside>

      </div>

      {/* Sticky bottom banner for guests */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(90deg, #4f46e5 0%, #cca43b 100%)",
        padding: "14px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.4)"
      }}>
        <div style={{
          display: "flex", width: "100%", maxWidth: "1000px",
          justifyContent: "space-between", alignItems: "center", gap: "20px"
        }}>
          <div style={{ color: "#ffffff" }}>
            <div style={{ fontWeight: 900, fontSize: "18px", letterSpacing: "-0.2px" }}>Don't miss what's happening</div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>People on Kizuno are the first to know.</div>
          </div>
          <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
            <Link href="/login" style={{
              background: "transparent", color: "#ffffff", border: "1.5px solid #ffffff",
              padding: "8px 20px", borderRadius: "20px", fontWeight: 700, fontSize: "14px",
              textDecoration: "none"
            }}>
              Log in
            </Link>
            <Link href="/register" style={{
              background: "#ffffff", color: "#0c0b10",
              padding: "8px 20px", borderRadius: "20px", fontWeight: 700, fontSize: "14px",
              textDecoration: "none"
            }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
