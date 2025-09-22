import React, { useEffect, useState, useRef } from 'react';
import PostListadmin from '../components/PostListAdmin';
import OnlineUsersSidebar from '../components/OnlineUsersSidebar';
import CreateGroup from '../components/groups/CreateGroup';
import InviteUser from '../components/groups/InviteUser';
import GroupLists from '../components/groups/GroupList';
import { Link } from 'react-router-dom';
import Onlineuser from '../components/icon/onlineuser'
import Groupicon from '../components/icon/groupsicon'
import Menuicon from '../components/icon/menuicon'
import Loading  from '../components/icon/loading';

const Useradmin = ({ user, posts, onRefresh, onLike, likes, userLiked, onLogout, navigateToProfile }) => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // State for mobile dropdown
  const dropdownRef = useRef(null);
  const postsPerPage = 20;
  const [groupId, setGroupId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (posts && posts.length) setLoading(false);
  }, [posts]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return <p>Please log in to view the posts.</p>;

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = posts.slice(startIndex, startIndex + postsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleSidebar = (sidebar) => {
    if (sidebar === 'groups') {
      setShowGroups(!showGroups);
      setShowOnlineUsers(false);
    } else if (sidebar === 'online') {
      setShowOnlineUsers(!showOnlineUsers);
      setShowGroups(false);
    }
    setShowDropdown(false); // Close dropdown after selection
  };

  // Function to close the active sidebar
  const closeSidebar = () => {
    setShowGroups(false);
    setShowOnlineUsers(false);
  };

  return (
    <div className="home-container" style={{
      maxWidth: '100%',
      margin: 'auto',
      padding: '1px clamp(1px, 0vw, 120px) 10px clamp(0px, 0vw, 120px)'
    }}>
      {loading ? (
        <p style={{ textAlign: 'center' }}><Loading /></p>
      ) : (
        <>
          <div className="main-layout" style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 80px)',
            overflow: 'hidden',
          }}>
            {/* Mobile Dropdown Menu for Icons */}
            {isMobile && (
              <div ref={dropdownRef} style={{ position: 'relative', width: '100%', padding: '10px', backgroundColor: 'transparent', borderBottom: '1px solid #ffffffff', boxShadow: '0 0px 0px rgba(0,0,0,0.05)' }}>
                <div onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '1px 15px', borderRadius: '10px', backgroundColor: 'transparent', justifyContent: 'space-between' }}>
          
                  <span><Menuicon/></span>
                </div>
                {showDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', zIndex: 20 }}>
                    <div
                      onClick={() => toggleSidebar('groups')}
                      style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: showGroups ? '#f0f0f0' : 'transparent' }}
                    >
                      <span role="img" aria-label="groups icon"></span> Groups
                    </div>
                    <div
                      onClick={() => toggleSidebar('online')}
                      style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: showOnlineUsers ? '#f0f0f0' : 'transparent' }}
                    >
                      <span role="img" aria-label="online users icon"></span> Online Users
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="content-area" style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
              {/* Desktop Sidebar Icons (Left) */}
              {!isMobile && (
                <div className="sidebar-icons" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '20px 10px',
                  backgroundColor: '#f8f9fa',
                  borderRight: '1px solid #e9ecef',
                  boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                  zIndex: 10,
                  minWidth: '60px',
                  alignItems: 'center',
                }}>
                  <div
                    onClick={() => toggleSidebar('groups')}
                    className="icon-button"
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: showGroups ? '#e2e6ea' : 'transparent',
                      textAlign: 'center',
                      transition: 'background-color 0.2s ease-in-out, transform 0.2s ease-in-out',
                      transform: showGroups ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: showGroups ? 'inset 0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = showGroups ? '#e2e6ea' : 'transparent'}
                  >
                    <span role="img" aria-label="groups icon" style={{ fontSize: '24px' }}><Groupicon/> </span>
                    <p style={{ fontSize: '10px', margin: '4px 0 0', color: '#6c757d', fontWeight: 'bold' }}>Groups</p>
                  </div>
                  <div
                    onClick={() => toggleSidebar('online')}
                    className="icon-button"
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: showOnlineUsers ? '#e2e6ea' : 'transparent',
                      textAlign: 'center',
                      transition: 'background-color 0.2s ease-in-out, transform 0.2s ease-in-out',
                      transform: showOnlineUsers ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: showOnlineUsers ? 'inset 0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = showOnlineUsers ? '#e2e6ea' : 'transparent'}
                  >
                    <span role="img" aria-label="online users icon" style={{ fontSize: '24px' }}><Onlineuser /></span>
                    <p style={{ fontSize: '10px', margin: '4px 0 0', color: '#6c757d', fontWeight: 'bold' }}>Online</p>
                  </div>
                </div>
              )}

              {/* Conditionally rendered sidebars */}
              {showGroups && (
                <div className="groups-sidebar" style={{
                  width: isMobile ? '100%' : '280px',
                  borderRight: '1px solid #e9ecef',
                  overflowY: 'auto',
                  padding: '15px',
                  background: '#f8f9fa',
                  transition: 'width 0.3s ease-in-out',
                  boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                  position: isMobile ? 'absolute' : 'static', // Positioning for mobile
                  top: isMobile ? '0' : 'auto',
                  left: isMobile ? '0' : 'auto',
                  height: isMobile ? '70%' : 'auto',
                  zIndex: 15,
                }}>
                  {isMobile && (
                    <button onClick={closeSidebar} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer' }}>&times;</button>
                  )}
             <CreateGroup user={user} groupId={groupId} />
                </div>
              )}

              {showOnlineUsers && (
                <div className="online-users-sidebar" style={{
                  width: isMobile ? '100%' : '280px',
                  borderLeft: '1px solid #e9ecef',
                  background: '#f8f9fa',
                  overflowY: 'auto',
                  padding: '0px',
                  transition: 'width 0.3s ease-in-out',
                  boxShadow: '-2px 0 1px rgba(0,0,0,0.05)',
                  position: isMobile ? 'absolute' : 'static', // Positioning for mobile
                  top: isMobile ? '0' : 'auto',
                  left: isMobile ? '0' : 'auto',
                  height: isMobile ? '70%' : 'auto',
                  zIndex: 15,
                }}>
                  {isMobile && (
                    <button onClick={closeSidebar} style={{ position: 'absolute', top: '10px', right: '1px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                  )}
                  <OnlineUsersSidebar user={user} />
                </div>
              )}

              {/* MAIN CONTENT */}
              <div className="main-content" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                backgroundColor: '#fff',
                padding: '1px',
              }}>
                <PostListadmin
                  posts={currentPosts}
                  user={user}
                  onReply={() => { }}
                  onRefresh={onRefresh}
                  onLike={onLike}
                  likes={likes}
                  userLiked={userLiked}
                />
              </div>
            </div>
          </div>

          {/* PAGINATION */}
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

export default Useradmin;