import React, { useEffect, useState } from 'react';
import Loading from './icon/loading';
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstname: '', lastname: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('forumUser');
    if (!storedUser) {
      setError('User not logged in.');
      return;
    }
  const API_URL= process.env.REACT_APP_API_URL;
    const parsedUser = JSON.parse(storedUser);
    const userId = parsedUser.id;

    fetch(`${API_URL}/getusers.php?user_id=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user data');
        return res.json();
      })
      .then((data) => {
        if (!data.success || !data.user) {
          setError(data.message || 'User not found');
        } else {
          setUser(data.user);
          setFormData({
            firstname: data.user.firstname,
            lastname: data.user.lastname,
          });
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Something went wrong while loading your profile.');
      });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/update_user_name.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          firstname: formData.firstname,
          lastname: formData.lastname,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setUser((prev) => ({
          ...prev,
          firstname: formData.firstname,
          lastname: formData.lastname,
        }));
        alert('Name updated successfully!');
        setIsEditing(false);
      } else {
        alert(result.message || 'Failed to update name.');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('An error occurred while saving.');
    }
  };
  const API_URL= process.env.REACT_APP_API_URL;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!user) return <div style={{ padding: 20 }}><Loading /></div>;

  const cleanProfilePic = user.profile_pic
    ? user.profile_pic.replace(/^\/+/, '').replace(/\\/g, '/')
    : '';
  const imageUrl = cleanProfilePic
    ? `${API_URL}/uploads/${cleanProfilePic}`
    : '/Logo/default-avatar.png';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
      <header style={{ background: '#3a90b8', color: 'white', padding: '30px' }}>
        <h1 style={{ margin: 0 }}>My Profile</h1>
      </header>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '20px',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <img
          src={imageUrl}
          alt="Profile"
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '20px',
          }}
          onError={(e) => {
            e.target.src = '/Logo/default-avatar.png';
          }}
        />
        <div>
          <h2 style={{ margin: '0 0 10px 0' }}>
            {user.firstname} {user.lastname} ({user.username}){' '}
            <span
              style={{
                background: '#1e88e5',
                color: 'white',
                borderRadius: '12px',
                padding: '3px 8px',
                fontSize: '12px',
              }}
            >
              {user.typeofuser}
            </span>
          </h2>
          <p style={{ margin: 0 }}>Joined on {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          margin: '20px',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h3>General Information</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', margin: '10px 0' }}>
            <strong>Name:</strong>{' '}
            {isEditing ? (
              <>
                <input
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                <input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </>
            ) : (
              `${user.firstname} ${user.lastname}`
            )}
          </div>

          <div style={{ flex: '1 1 300px', margin: '10px 0' }}>
            <strong>Username:</strong> {user.username}
          </div>

          <div style={{ flex: '1 1 300px', margin: '10px 0' }}>
            <strong>Email:</strong> {user.email}
          </div>

          <div style={{ flex: '1 1 300px', margin: '10px 0' }}>
            <strong>Country:</strong> {user.country}
          </div>

          <div style={{ flex: '1 1 300px', margin: '10px 0' }}>
            <strong>Profile:</strong> {user.typeofuser}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          {isEditing ? (
            <>
              <button onClick={handleSave} style={{ marginRight: 10 }}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit Name</button>
          )}
        </div>
      </div>
    </div>
  );
}
