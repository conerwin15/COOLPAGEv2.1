import React, { useEffect, useState } from 'react';
import Loading from './icon/loading';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstname: '', lastname: '' });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

    const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState('');

    const refreshUserData = async () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('forumUser'));
    if (!storedUser) return;

    const res = await fetch(`${API_URL}/getusers.php?user_id=${storedUser.id}`);
    const data = await res.json();

    if (data.success && data.user) {
      setUser(data.user);
      setFormData({
        firstname: data.user.first_name,
        lastname: data.user.last_name,
      });
    }
  } catch (err) {
    console.error('Error refreshing user data:', err);
  }
};

  useEffect(() => {
    const storedUser = localStorage.getItem('forumUser');
    if (!storedUser) {
      setError('User not logged in.');
      return;
    }

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
            firstname: data.user.first_name,
            lastname: data.user.last_name,
          });
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Something went wrong while loading your profile.');
      });
  }, [API_URL]);

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


  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setPreviewPic(URL.createObjectURL(file)); // show preview before upload
    }
  };

  const handleUploadProfilePic = async () => {
    if (!newProfilePic) {
      alert('Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('profile_pic', newProfilePic);

    try {
      const res = await fetch(`${API_URL}/update_profile_pic.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
    if (result.success) {
      alert('Profile picture updated!');
      setNewProfilePic(null);
      setPreviewPic('');

      // Refresh user data to get updated profile picture
      await refreshUserData();
    } else {
      alert(result.message || 'Failed to update picture.');
    }
  } catch (err) {
    console.error('Upload error:', err);
    alert('Error while uploading picture.');
  }
};

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSave = async () => {
    if (passwordData.new_password !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/update_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Password updated successfully!');
        setPasswordData({ current_password: '', new_password: '' });
        setConfirmPassword('');
        setIsUpdatingPassword(false);
      } else {
        alert(result.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Password update error:', err);
      alert('Error while updating password.');
    }
  };

  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!user) return <div style={{ padding: 20 }}><Loading /></div>;

const imageUrl = user.profile_picture || '/Logo/default-avatar.png';

  // Reusable styles
  const cardStyle = {
    background: '#fff',
    margin: '20px',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  };

  const inputStyle = {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginRight: '10px',
    marginBottom: '10px',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
    maxWidth: '250px',
  };

  const buttonStyle = {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '8px',
    background: '#3a90b8',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background 0.3s',
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f7fb', minHeight: '100vh' }}>
      <header style={{ background: '#3a90b8', color: 'white', padding: '30px' }}>
        <h1 style={{ margin: 0 }}>My Profile</h1>
      </header>

      {/* Profile header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '20px',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '12px',
          margin: '20px',
        }}
      >
      

       <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <div style={{ position: 'relative', width: 100, height: 100, margin: 10 }}>
    <img
      src={imageUrl}
      alt="Profile"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #3a90b8',
 
      }}
    />
    <label
      htmlFor="profilePicInput"
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        background: '#3a90b8',
        color: 'white',
        borderRadius: '50%',
        width: 36,
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
      title="Change Profile Picture"
    >
      <span role="img" aria-label="camera">📷</span>
    </label>
    <input
      type="file"
      id="profilePicInput"
      accept="image/*"
      onChange={handleProfilePicChange}
      style={{ display: 'none' }}
    />
  </div>

  {newProfilePic && (
    <button
      onClick={handleUploadProfilePic}
      style={{
        marginTop: 10,
        padding: '8px 16px',
        background: '#3a90b8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      Save Photo
    </button>
  )}
</div>
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span style={{ fontSize: '24px', fontWeight: '600' }}>
      {user.firstname} {user.lastname}
    </span>
    <span
      style={{
        background: '#1e88e5',
        color: 'white',
        borderRadius: '12px',
        padding: '3px 10px',
        fontSize: '10px',
        fontWeight: '500',
      }}
    >
      {user.typeofuser}
    </span>
  </div>

  <span style={{ fontSize: '16px', color: '#555', marginTop: '4px' }}>
    ({user.username})
  </span>

  <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: '14px' }}>
    Joined on {new Date(user.created_at).toLocaleDateString()}
  </p>
</div>
        </div>
 



      {/* General Info */}
    <div style={cardStyle}>
  <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
    General Information
  </h3>

  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '30px 60px',
      alignItems: 'center',
      fontSize: '15px',
      lineHeight: '1.6',
    }}
  >
    {/* Name */}
    <div style={{ flex: '1 1 250px' }}>
      <strong style={{ color: '#333' }}>Name:</strong>{' '}
      {isEditing ? (
        <>
          <input
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            style={{ ...inputStyle, marginLeft: '8px' }}
          />
        </>
      ) : (
        `${user.firstname} ${user.lastname}`
      )}
    </div>

    {/* Username */}
    <div style={{ flex: '1 1 200px' }}>
      <strong style={{ color: '#333' }}>Username:</strong> {user.username}
    </div>

    {/* Email */}
    <div style={{ flex: '1 1 300px' }}>
      <strong style={{ color: '#333' }}>Email:</strong> {user.email}
    </div>

    {/* Country */}
    <div style={{ flex: '1 1 200px' }}>
      <strong style={{ color: '#333' }}>Country:</strong> {user.country}
    </div>

    {/* Profile */}
    <div style={{ flex: '1 1 200px' }}>
      <strong style={{ color: '#333' }}>Profile:</strong> {user.typeofuser}
    </div>
  </div>

  {/* Edit / Save Buttons */}
  <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
    {isEditing ? (
      <>
        <button onClick={handleSave} style={buttonStyle}>
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          style={{ ...buttonStyle, background: '#aaa' }}
        >
          Cancel
        </button>
      </>
    ) : (
      <button onClick={() => setIsEditing(true)} style={buttonStyle}>
        Edit Name
      </button>
    )}
  </div>
</div>

      {/* Update Password */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '15px' }}>Update Password</h3>
        {isUpdatingPassword ? (
          <>
            <input
              type="password"
              name="current_password"
              placeholder="Current Password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              style={inputStyle}
            />
            <input
              type="password"
              name="new_password"
              placeholder="New Password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
            <div style={{ marginTop: 15 }}>
              <button onClick={handlePasswordSave} style={buttonStyle}>Save</button>
              <button
                onClick={() => setIsUpdatingPassword(false)}
                style={{ ...buttonStyle, background: '#aaa' }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setIsUpdatingPassword(true)} style={buttonStyle}>
            Change Password
          </button>
        )}
      </div>
    </div>
  );
}
