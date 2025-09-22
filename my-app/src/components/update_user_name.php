import React, { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import InviteUser from "./InviteUser";
import GroupPostList from "../groups/GroupPosts";

const GroupDashboard = ({
  user,
  posts,
  onRefresh,
  onLike,
  likes,
  userLiked,
}) => {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);

  const [groupPosts, setGroupPosts] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(true); // default true for desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fetchPosts = useCallback(async () => {
    if (!groupId || !user?.id) return;

    try {
      const res = await fetch(
        `https://cool.reallylesson.com/backend/get_group_posts.php?group_id=${groupId}&user_id=${user.id}`
      );
      const data = await res.json();

      if (data.success) {
        setGroupPosts(data.posts || []);
        if (data.members) {
          setGroupMembers(data.members);
        }
        if (onRefresh) onRefresh();
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (err) {
      console.error("Error fetching group posts:", err);
    }
  }, [groupId, user?.id, onRefresh]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowInvite(!mobile); // sidebar auto visible if desktop
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // run once
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: showInvite ? "260px" : "0",
          transition: "width 0.3s ease",
          overflow: "hidden",
          borderRight: showInvite ? "1px solid #ccc" : "none",
          backgroundColor: "#f8f9fa",
          padding: showInvite ? "16px" : "0",
        }}
      >
        {showInvite && <InviteUser groupId={numericGroupId} user={user} />}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#fff",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Group Dashboard
        </h2>

        <GroupPostList
          groupId={groupId}
          user={user}
          posts={posts}
          onRefresh={onRefresh}
          onLike={onLike}
          likes={likes}
          userLiked={userLiked}
        />
      </div>

      {/* Floating Button for Mobile Only */}
      {isMobile && (
        <button
          onClick={() => setShowInvite(!showInvite)}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            padding: "10px 16px",
            borderRadius: "50px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 100,
          }}
        >
          {showInvite ? "Close Invite" : "Invite User"}
        </button>
      )}
    </div>
  );
};

export default GroupDashboard;
