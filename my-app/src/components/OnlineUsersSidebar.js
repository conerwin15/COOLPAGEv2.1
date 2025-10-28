import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const OnlineUsersSidebar = ({ user }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
const navigate = useNavigate();
  // Helper: log user id for debugging
  useEffect(() => {
    console.log("👤 Current user:", user);
    if (!user?.id) {
      console.warn("⚠️ User ID is missing. Activity won't be tracked.");
    }
  }, [user]);

  // 🔁 Update user activity every 30s
  useEffect(() => {
    if (!user || !user.id) return;
 const API_URL= process.env.REACT_APP_API_URL;
    const updateActivity = async () => {
      try {
        console.log("📤 Sending activity update for user_id:", user.id);

        const res = await fetch(`${API_URL}/update_activity.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id }),
          mode: 'cors',
        });

        const data = await res.json();
        console.log('✅ Activity update response:', data);

        if (!data.success) {
          console.warn('⚠️ Activity update failed:', data.error);
        }
      } catch (err) {
        console.error('❌ Failed to update activity:', err);
      }
    };

    updateActivity(); // initial trigger
    const interval = setInterval(updateActivity, 30000); // every 30s
    return () => clearInterval(interval);
  }, [user]);

  // 🔁 Fetch online users every 30s
   const API_URL= process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/get_online_users.php`, {
          method: 'GET',
          mode: 'cors',
        });

        const data = await res.json();
        console.log('✅ Online users fetched:', data);

        if (data.success && Array.isArray(data.users)) {
          setOnlineUsers(data.users);
        } else {
          setOnlineUsers([]);
          console.warn('⚠️ Invalid user data structure:', data);
        }
      } catch (err) {
        console.error('❌ Error fetching online users:', err);
      }
    };

    fetchOnlineUsers(); // initial trigger
    const interval = setInterval(fetchOnlineUsers, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

return (
 <div
      style={{
        width: 'auto',
        padding: '1px',
        borderLeft: '1px solid #e6e6e6',
        background: '#ffffff',
        height: '100%',
        overflowY: 'auto',
        boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.03)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h5
        style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: '#2ecc71',
            animation: 'pulse 1.5s infinite',
          }}
        >
          ●
        </span>
        Online Users
      </h5>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {onlineUsers.length === 0 ? (
          <li
            style={{
              textAlign: 'center',
              padding: '12px 0',
              color: '#bbb',
              fontStyle: 'italic',
              fontSize: '14px',
            }}
          >
            No users online
          </li>
        ) : (
          onlineUsers.map((u) => (
            <li
              key={u.id}
              style={{
                marginBottom: '12px',
              }}
            >
              <Link
                to={`/profile/${u.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: '#f9fafc',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eef3f8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafc';
                }}
              >
               <img
  src={
    u.profile_pic
      ? `${API_URL}/uploads/${u.profile_pic}`
      : '/Logo/default-avatar.png'
  }
  alt={`${u.username}'s avatar`}
  onError={(e) => {
    e.currentTarget.src = '/Logo/default-avatar.png';
  }}
  style={{
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '12px',
    border: '2px solid #ddd',
  }}
/>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontWeight: '500',
                      fontSize: '15px',
                      color: '#34495e',
                    }}
                  >
                    {u.username}
                  </span>
                  <span style={{ fontSize: '12px', color: '#2ecc71' }}>
                    Online
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
);

};

export default OnlineUsersSidebar;
