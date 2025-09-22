import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CreateGroup = ({ user }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [selectedTab, setSelectedTab] = useState('my');
  const API_URL= process.env.REACT_APP_API_URL;
  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/get_groups.php?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMyGroups(data.my_groups || []);
        setPublicGroups(data.public_groups || []);
        setPendingInvites(data.pending_invites || []);
        setSentInvites(data.sent_invites || []);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchGroups();
  }, [user]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setMessage('⚠️ Group name is required.');
      setMessageType('warning');
      return;
    }

    const isDuplicate = myGroups.some(g => g.name.toLowerCase() === groupName.trim().toLowerCase());
    if (isDuplicate) {
      setMessage('⚠️ You already have a group with this name.');
      setMessageType('warning');
      return;
    }

    if (!user || !user.id) {
      setMessage('❌ You must be logged in to create a group.');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/create_group.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, description, visibility, created_by: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setMessageType('success');
        setGroupName('');
        setDescription('');
        setVisibility('public');
        setShowForm(false);
        fetchGroups();
      } else {
        setMessage(`❌ ${data.message}`);
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Network or server error. Please try again.');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const respondToInvite = async (groupId, action) => {
  console.log('Responding to invite:', { groupId, action, userId: user.id });

  try {
    const res = await fetch(`${API_URL}/respond_to_invite.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: groupId,
        user_id: user.id,
        action,
      }),
    });

    const data = await res.json();
    console.log('Response:', data);

    if (data.success) {
      alert(data.message);
      fetchGroups(); // This should refresh the list
    } else {
      alert('❌ ' + data.message);
    }

  } catch (err) {
    console.error('Network error:', err);
    alert('❌ Network error.');
  }
};
  return (
    <div style={{ padding: '20px',  justifyContent: 'center',border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa', maxWidth: '700px', margin: '20px auto' }}>
      <button
  onClick={() => setShowForm(!showForm)}
  disabled={!user} 
  style={{ justifyContent: 'center',  display: 'flex',
    backgroundColor: 'transparent',
    color: user ? '#007bff' : '#888',
    width:'100%',
    padding: '10px 16px',
    border: `2px solid ${user ? '#007bff' : '#ccc'}`,
    borderRadius: '6px',
    cursor: user ? 'pointer' : 'not-allowed',
    marginBottom: '1px',
    opacity: user ? 1 : 0.6,
    alignContent:'center',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  }}
  onMouseEnter={(e) => {
    if (user) {
      e.target.style.backgroundColor = '#007bff';
      e.target.style.color = '#fff';
    }
  }}
  onMouseLeave={(e) => {
    if (user) {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.color = '#007bff';
    }
  }}
>
  {showForm ? 'Cancel' : ' Create Group'}
</button>

      {showForm && (
        <div style={{ marginBottom: '50px' }}>
          <h3 style={{ marginBottom: '20px',  marginTop: '20px'}}>Create a New Group</h3>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description (optional)"
            rows={3}
            style={{ width: '100%', padding: '10px', marginBottom: '12px' }}
          />
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button
            onClick={handleCreateGroup}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? '#6c757d' : '#28a745',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Group'}
          </button>
        </div>
      )}

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          backgroundColor:
            messageType === 'success' ? '#d4edda' :
            messageType === 'error' ? '#f8d7da' :
            '#fff3cd',
          color:
            messageType === 'success' ? '#155724' :
            messageType === 'error' ? '#721c24' :
            '#856404',
          border:
            messageType === 'success' ? '1px solid #c3e6cb' :
            messageType === 'error' ? '1px solid #f5c6cb' :
            '1px solid #ffeeba',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />

      <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1px',
    padding: '10px 15px',
       width:'100%'
  }}
>
  <select
    value={selectedTab}
    onChange={(e) => setSelectedTab(e.target.value)}
    style={{
      padding: '10px 16px',
     
      background: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease-in-out',
      width:'100%'
    }}
    onMouseOver={(e) => (e.target.style.borderColor = '#888')}
    onMouseOut={(e) => (e.target.style.borderColor = '#ccc')}
  >
    <option value="my">My Groups</option>
    <option value="public">Public Groups</option>
    <option value="pending">Pending Invites</option>
    <option value="sent"> Sent Invites</option>
  </select>
</div>
      {selectedTab === 'my' && myGroups.length === 0 ? (
        <p style={{ fontStyle: 'italic' }}>No groups created.</p>
      ) : selectedTab === 'my' ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {myGroups.map((g) => (
            <div key={g.id} style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '6px', background: '#ffffff' }}>
              <strong>
                <Link to={`/group/${g.id}`} style={{ textDecoration: 'none', color: '#007bff' }}>{g.name}</Link>
              </strong>
              <span style={{ fontSize: '12px', color: '#888' }}> ({g.visibility})</span>
              <p style={{ margin: '6px 0 0' }}>{g.description || 'No description.'}</p>
            </div>
          ))}
        </div>
      ) : selectedTab === 'public' ? (
        publicGroups.length === 0 ? (
          <p style={{ fontStyle: 'italic' }}>No public groups available.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {publicGroups.map((g) => (
              <div key={g.id} style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '6px', background: '#f0f8ff' }}>
 <Link to={`/group/public/${g.id}`} style={{ textDecoration: 'none', color: '#007bff' }}>{g.name}</Link>
                <p style={{ margin: '6px 0 0' }}>{g.description || 'No description.'}</p>
              </div>
            ))}
          </div>
        )
      ) : selectedTab === 'pending' ? (
        pendingInvites.length === 0 ? (
          <p style={{ fontStyle: 'italic' }}>No pending invites.</p>
        ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
  {pendingInvites.map((group) => (
    <li
      key={group.id}
      style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
        {group.name}
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280' }}>
        Invited by: {group.invited_by}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => respondToInvite(group.id, 'accept')}
          style={{
            padding: '4px 10px',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
        <button
          onClick={() => respondToInvite(group.id, 'decline')}
          style={{
            padding: '4px 10px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
      </div>
    </li>
  ))}
</ul>

        )
      ) : selectedTab === 'sent' ? (
        sentInvites.length === 0 ? (
          <p style={{ fontStyle: 'italic' }}>No invites sent.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
  {sentInvites.map((invite, index) => (
    <li
      key={index}
      style={{
        backgroundColor: '#f9f9f9',
        padding: '12px 16px',
        marginBottom: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderLeft: '4px solid #4a90e2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '15px',
        color: '#333',
      }}
    >
      <span>
        👤 <strong>{invite.username}</strong> <span style={{ color: '#888' }}>invited to</span> 🏷️ <strong>{invite.group_name}</strong>
      </span>
    </li>
  ))}
</ul>
        )
      ) : null}
    </div>
  );
};

export default CreateGroup;
