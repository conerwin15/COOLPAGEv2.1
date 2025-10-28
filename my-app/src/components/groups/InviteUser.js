import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InviteUser = ({ user, onRefresh }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);
 const { groupId } = useParams(); 
  const togglePopup = () => {
    setShowPopup(!showPopup);
    setMessage('');
    setQuery('');
    setSuggestions([]);
    setSelectedUserId(null);
  };
  const API_URL= process.env.REACT_APP_API_URL;
  const searchUsers = async (q) => {
    setQuery(q);
    if (q.length < 2) return setSuggestions([]);

    try {
      const res = await fetch(`${API_URL}/search_users.php?q=${q}`);
      const data = await res.json();
      if (data.success) setSuggestions(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (user) => {
    setSelectedUserId(user.id);
    setQuery(user.username);
    setSuggestions([]);
  };

  const handleInvite = async () => {
    console.log('Sending invite with:', { groupId, selectedUserId});

    if (!groupId || !selectedUserId || !user?.id) {
      return setMessage("⚠️ Missing group_id, user_id (invitee), or invited_by");
    }

    try {
      const res = await fetch(`${API_URL}/invite_user_to_group.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: groupId,
          user_id: selectedUserId,
          invited_by: user.id,
        }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (data.success && onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setMessage('❌ Error inviting user.');
    }
  };

  const fetchGroupMembers = async () => {
  try {
    const res = await fetch(`${API_URL}/get_group_members.php?group_id=${groupId}`);
    const data = await res.json();
    if (data.success) {
      setMembers(data.members);  // ✅ This should update your component state
    } else {
      console.error('Backend error:', data.message);  // ❗️ADD THIS for debugging
    }
  } catch (err) {
    console.error('Error fetching group members:', err);
  }
};

useEffect(() => {
  if (groupId) {
    fetchGroupMembers();
  }
}, [groupId]);

  return (
    <div>
      {/* Invite Button */}
      <button
        onClick={togglePopup}
        style={{
          padding: '10px 15px',
          background: '#1d4ed8',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '15px',
          width: '100%',
        }}
      >
        Invite User
      </button>

      {/* Group Members */}
  <div
  style={{
    marginBottom: '20px',
    background: '#f9f9f9',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  }}
>
  <h4 style={{ marginBottom: '12px', color: '#333', fontSize: '18px' }}>👥 Group Members</h4>

  {Array.isArray(members) && members.length === 0 ? (
    <p style={{ fontStyle: 'italic', fontSize: '14px', color: '#888' }}>
      No members yet.
    </p>
  ) : Array.isArray(members) ? (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {members.map((member) => (
        <li
          key={member.id}
          style={{
            padding: '10px 12px',
            marginBottom: '8px',
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #ddd',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#f1f1f1')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
        >
          <span style={{ fontWeight: 500, color: '#333' }}>{member.username}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p style={{ color: 'red', fontSize: '14px' }}>
      ⚠️ Error: Members data not available.
    </p>
  )}
</div>

      {/* Invite Popup Modal */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            zIndex: 1000,
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <h3>Invite User to Group</h3>

          <input
            type="text"
            value={query}
            onChange={(e) => searchUsers(e.target.value)}
            placeholder="Search user by name"
            style={{ width: '100%', padding: '8px', marginTop: '10px' }}
          />

          {suggestions.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                marginTop: '8px',
                background: '#f1f1f1',
                borderRadius: '4px',
                maxHeight: '150px',
                overflowY: 'auto',
              }}
            >
              {suggestions.map((u) => (
                <li
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  {u.username}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleInvite}
            style={{
              marginTop: '10px',
              padding: '10px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Invite
          </button>

          {message && (
            <p
              style={{
                marginTop: '10px',
                color: message.includes('⚠️') || message.includes('❌') ? 'red' : 'green',
              }}
            >
              {message}
            </p>
          )}

          {/* Close Button */}
          <button
            onClick={togglePopup}
            style={{
              marginTop: '15px',
              padding: '6px 10px',
              background: '#ccc',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default InviteUser;
