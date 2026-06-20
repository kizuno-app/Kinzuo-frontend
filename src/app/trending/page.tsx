"use client";
import { useQuery } from "@tanstack/react-query";
import { discoverService } from "@/services/discover.service";
import { useAuthStore } from "@/store/auth.store";
import PostCard from "@/components/PostCard";

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

export default function TrendingPage() {
  const { user } = useAuthStore();

  const { data: posts = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['org-trending-posts'],
    queryFn: () => discoverService.getTrending(),
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  return (
    <>
      {/* Premium Sticky Header with Gradient Title */}
      <div style={{ 
        padding: "20px 24px", 
        borderBottom: "1px solid #262626", 
        marginBottom: "20px", 
        position: "sticky", 
        top: 0, 
        background: "rgba(10,10,10,0.85)", 
        backdropFilter: "blur(12px)", 
        zIndex: 10 
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ 
              fontSize: "24px", 
              fontWeight: 800, 
              background: "linear-gradient(90deg, #4f46e5 0%, #d4af37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0, 
              marginBottom: "4px",
              letterSpacing: "-0.5px"
            }}>
              Trending Now
            </h1>
            <p style={{ fontSize: "14px", color: "#a1a1aa", margin: 0 }}>
              Top viral updates within your organization
            </p>
          </div>
          <button 
            onClick={() => refetch()}
            style={{
              background: "#262626",
              border: "1px solid #333",
              borderRadius: "12px",
              color: "#fafafa",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            className="hover:bg-[#333]"
          >
            Refresh
          </button>
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
          <div style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>
            Failed to load trending posts. Please try again.
          </div>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <div style={{ 
            color: "#71717a", 
            textAlign: "center", 
            padding: "80px 20px",
            background: "#171717",
            borderRadius: "24px",
            border: "1px solid #262626",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <div>
              <div style={{ fontWeight: 700, color: "#fafafa", fontSize: "16px", marginBottom: "4px" }}>No trending posts yet</div>
              <div style={{ fontSize: "14px" }}>Posts within your organization will appear here as they gain traction.</div>
            </div>
          </div>
        )}

        {!isLoading && !isError && posts.length > 0 && (
          <div>
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
