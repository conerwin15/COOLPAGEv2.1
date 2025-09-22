import React, { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import InviteUser from './InviteUser';
import GroupPostList from '../groups/GroupPosts';
import Loading  from '../icon/loading';

const PublicGroupPage = ({ user, onRefresh, onLike, likes, userLiked }) => {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupPosts, setGroupPosts] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const API_URL= process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId || !user || !user.id) return;
      try {
        const res = await fetch(
          `${API_URL}/get_groups.php?group_id=${groupId}`
        );
        const data = await res.json();
        if (data.success && data.group.visibility === 'public') {
          setGroup(data.group);
        } else {
          setGroup(null);
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, user]);

  const fetchPosts = useCallback(async () => {
    if (!groupId || !user || !user.id) return;
    try {
      const res = await fetch(
        `${API_URL}/get_group_posts.php?group_id=${groupId}&user_id=${user.id}`
      );
      const data = await res.json();
      if (data.success) {
        setGroupPosts(data.posts || []);
        if (onRefresh) onRefresh();
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching group posts:', err);
    }
  }, [groupId, user, onRefresh]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) return <p style={{ padding: '20px' }}><Loading /></p>;
  if (!group)
    return (
      <p style={{ padding: '20px', color: 'red' }}>
        ❌ Public group not found or access denied.
      </p>
    );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        fontFamily: 'Segoe UI, sans-serif',
        backgroundColor: '#f5f7fa',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '260px',
          minWidth: '200px',
          padding: '20px',
          borderRight: '1px solid #eee',
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
          overflowY: 'auto',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#222',
            marginBottom: '10px',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          {group.name}
          {showTooltip && group.description && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                padding: '10px',
                backgroundColor: '#fff',
                color: '#333',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                whiteSpace: 'normal',
                zIndex: 100,
                maxWidth: '240px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              {group.description}
            </div>
          )}
        </div>

        <div style={{ fontSize: '13px', color: '#777', lineHeight: 1.6 }}>
          <p>
            <strong>Creator:</strong> {group.created_by_name || group.created_by}
          </p>
          <p>
            <strong>Created At:</strong> {group.created_at}
          </p>
        </div>

        {/* Toggle Invite */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => setShowInvite(!showInvite)}
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%',
            }}
          >
            {showInvite ? 'Hide Invite' : 'Show Invite'}
          </button>

          {showInvite && (
            <div style={{ marginTop: '12px' }}>
              <InviteUser groupId={numericGroupId} user={user} />
            </div>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div
        style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          backgroundColor: '#fdfdfd',
        }}
      >
        <GroupPostList
          groupId={groupId}
          user={user}
          posts={groupPosts}
          onRefresh={onRefresh}
          onLike={onLike}
          likes={likes}
          userLiked={userLiked}
        />
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            div[style*="display: flex"][style*="row"] {
              flex-direction: column;
            }
            div[style*="border-right"] {
              width: 100% !important;
              border-right: none !important;
              border-bottom: 1px solid #eee;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PublicGroupPage;
