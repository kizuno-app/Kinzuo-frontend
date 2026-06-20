import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCompactTimeAgo } from "@/utils/date";

interface EmbeddedPostProps {
  post: any;
  /** If true, the card is not clickable (used in compose preview) */
  disableNavigation?: boolean;
}

export default function EmbeddedPost({ post, disableNavigation = false }: EmbeddedPostProps) {
  const router = useRouter();

  if (!post) return null;

  const authorName = post.author
    ? `${post.author.firstName} ${post.author.lastName}`
    : "Unknown User";
  const authorUsername =
    post.author?.username || authorName.replace(/\s+/g, "").toLowerCase();
  const hasAvatar = !!post.author?.avatar;

  const handleClick = (e: React.MouseEvent) => {
    if (disableNavigation) return;
    e.stopPropagation();
    router.push(`/user/post/${post.id}`);
  };

  const timeDisplay = formatCompactTimeAgo(post.createdAt);

  // Truncate content for compact display
  const truncatedContent =
    post.content && post.content.length > 280
      ? post.content.slice(0, 280) + "…"
      : post.content;

  const firstMedia =
    post.media && post.media.length > 0
      ? post.media[0]
      : post.mediaUrl || null;

  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "12px",
        background: "#0f0f0f",
        cursor: disableNavigation ? "default" : "pointer",
        transition: "border-color 0.2s",
        marginTop: "8px",
      }}
      className={!disableNavigation ? "hover:border-[#555]" : ""}
    >
      {/* Author Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
          flexWrap: "wrap",
          minWidth: 0,
        }}
      >
        <div
          className={!hasAvatar ? "avatar-gradient" : ""}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: post.author?.isOrgAccount ? "4px" : "50%",
            flexShrink: 0,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundImage: hasAvatar
              ? `url(${post.author.avatar})`
              : undefined,
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: "13px",
            color: "#fafafa",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {authorName}
        </span>
        <span style={{ fontSize: "13px", color: "#71767b" }}>
          @{authorUsername}
        </span>
        <span style={{ fontSize: "13px", color: "#71767b" }}>·</span>
        <span style={{ fontSize: "13px", color: "#71767b" }}>{timeDisplay}</span>
      </div>

      {/* Content */}
      {truncatedContent && (
        <p
          style={{
            fontSize: "14px",
            color: "#d4d4d8",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
          }}
        >
          {truncatedContent}
        </p>
      )}

      {/* Media preview */}
      {firstMedia && (
        <div
          style={{
            marginTop: "8px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #262626",
            maxHeight: "200px",
          }}
        >
          <img
            src={firstMedia}
            alt="Post media"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "200px",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}
    </div>
  );
}
