import React, { useState, useEffect } from 'react';
import PostList from './PostList';
import Loading from './icon/loading'
const ProfilePost = ({ user }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/get_posts.php`);
        const data = await res.json();

        if (data.success) {
          const filtered = data.posts.filter(post => Number(post.user_id) === Number(user.id));
          setUserPosts(filtered);
        } else {
          console.error('⚠️ Failed to load posts:', data.message);
        }
      } catch (err) {
        console.error('❌ Error fetching posts:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserPosts();
    }
  }, [user]);

  if (!user) return <p style={{ textAlign: 'center' }}>Please log in to view your profile posts.</p>;

  // 🔢 Pagination
  const totalPages = Math.ceil(userPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = userPosts.slice(startIndex, startIndex + postsPerPage);
  const API_URL= process.env.REACT_APP_API_URL;
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: '20px' }}>
        {user.username || user.email}'s Posts
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center' }}><Loading /></p>
      ) : (
        <>
     
          <PostList
            posts={currentPosts}
            user={user}
            onReply={() => {}}
            onRefresh={() => {
              // Optional re-fetch logic for refreshing posts
              setLoading(true);
              setTimeout(() => {
                fetch(`${API_URL}/get_posts.php`)
                  .then(res => res.json())
                  .then(data => {
                    const filtered = data.posts.filter(post => Number(post.user_id) === Number(user.id));
                    setUserPosts(filtered);
                  })
                  .finally(() => setLoading(false));
              }, 300);
            }}
          />

          {/* 🔀 Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination" style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
              gap: "12px",
              fontFamily: "Arial, sans-serif",
            }}>
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "20px",
                  border: "none",
                  backgroundColor: currentPage === 1 ? "#e0e0e0" : "#007bff",
                  color: "#fff",
                  fontWeight: "500",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease-in-out",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                &laquo; Prev
              </button>

              <span style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#333",
                padding: "8px 16px",
                backgroundColor: "#f1f1f1",
                borderRadius: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "20px",
                  border: "none",
                  backgroundColor: currentPage === totalPages ? "#e0e0e0" : "#007bff",
                  color: "#fff",
                  fontWeight: "500",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease-in-out",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePost;
