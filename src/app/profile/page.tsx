"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function ProfileRedirect() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      router.replace(`/profile/${user.id}`);
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <>
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        Loading profile...
      </div>
    </>
  );
}
