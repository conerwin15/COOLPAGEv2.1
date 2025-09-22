import React, { useEffect, useState } from 'react';

const GroupList = ({ user }) => {
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = () => {
    if (user?.id) {
      setLoading(true);
      fetch(`http://localhost/coolpage/my-app/backend/get_groups.php?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMyGroups(data.my_groups || []);
            setPublicGroups(data.public_groups || []);
            setPendingInvites(data.pending_invites || []);
            setOutgoingInvites(data.outgoing_invites || []);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const respondToInvite = async (groupId, action) => {
    try {
      const res = await fetch('http://localhost/coolpage/my-app/backend/respond_to_invite.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: groupId,
          user_id: user.id,
          action: action, // 'accept' or 'decline'
        }),
      });

      const data = await res.json();
      alert(data.message);
      fetchGroups(); // refresh list
    } catch (err) {
      console.error('Error responding to invite:', err);
      alert('Something went wrong.');
    }
  };

  if (loading) return <p>Loading groups...</p>;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* ✅ Pending Invites To Me */}
      {pendingInvites.length > 0 && (
        <>
          <h4 style={{ color: '#eab308' }}>Pending Invites</h4>
          <ul>
            {pendingInvites.map((group) => (
              <li key={group.id} style={{ marginBottom: 8 }}>
                {group.name} (Invited by: {group.invited_by})
                <div style={{ marginTop: 4 }}>
                  <button
                    onClick={() => respondToInvite(group.id, 'accept')}
                    style={{
                      marginRight: 8,
                      padding: '4px 10px',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
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
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ✅ Invites I Sent */}
      {outgoingInvites.length > 0 && (
        <>
          <h4 style={{ color: '#3b82f6', marginTop: '20px' }}>Invites I Sent</h4>
          <ul>
            {outgoingInvites.map((invite) => (
              <li key={invite.id}>
                {invite.username} — invited to <strong>{invite.group_name}</strong> ({invite.status})
              </li>
            ))}
          </ul>
        </>
      )}

      <h4 style={{ marginTop: '20px' }}>My Groups</h4>
      {myGroups.length ? (
        <ul>
          {myGroups.map((group) => (
            <li key={group.id}>
              {group.name} ({group.type})
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't joined any groups.</p>
      )}

      <h4 style={{ marginTop: '20px' }}>Public Groups</h4>
      {publicGroups.length ? (
        <ul>
          {publicGroups.map((group) => (
            <li key={group.id}>{group.name}</li>
          ))}
        </ul>
      ) : (
        <p>No public groups available.</p>
      )}
    </div>
  );
};

export default GroupList;
