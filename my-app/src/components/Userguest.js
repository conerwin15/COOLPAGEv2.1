import React, { useState, useEffect } from "react";
import PostListGuest from "../components/PostlistGuest";
import GroupListPublic from "../components/groups/GroupListPublic";
import Loading from "../components/icon/loading";

const UserGuest = ({ onLike, likes, userLiked }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  const API_URL= process.env.REACT_APP_API_URL;
  // Fetch posts for guests
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/get_posts.php`);
        const data = await res.json();

        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          console.error("Unexpected response format", data);
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle resizing for sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setShowSidebar(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.container}>
      {/* LEFT: Groups */}
      {showSidebar && (
        <aside style={styles.sidebar}>
          <GroupListPublic />
        </aside>
      )}

      {/* MIDDLE: Posts */}
      <main style={styles.posts}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "1px" }}><Loading /></div>
        ) : posts.length > 0 ? (
          <PostListGuest
            posts={posts}
            user={null} // no logged-in user
            onReply={() => {}}
            onRefresh={() => {}}
            onLike={onLike}
            likes={likes}
            userLiked={userLiked}
          />
        ) : (
          <div style={{ padding: "1px", textAlign: "center", color: "#555" }}>
            No public posts available
          </div>
        )}
      </main>

      {/* Floating button for mobile */}
      {isMobile && (
        <button
          style={styles.floatingButton}
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? "✖ Close Groups" : "Show Groups"}
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    background: "#f9f9f9",
    height: "100vh",
  },
  sidebar: {
    width: "200px",
    padding: "15px",
    borderRight: "1px solid #ddd",
    background: "#fff",
    overflowY: "auto",
    // no position, no zIndex → sits beside content
  },
  content: {
    flex: 1, // main content will take the rest of the space
    padding: "20px",
  },
  posts: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
  },
  floatingButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    padding: "10px 15px",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
  },
};

export default UserGuest;
