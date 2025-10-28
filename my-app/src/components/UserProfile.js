import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../components/icon/loading';

const defaultAvatar = '/Logo/default-avatar.png';
const baseUrl = 'http://localhost/coolpage/my-app/backend/uploads/';

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost/coolpage/my-app/backend/get_user_profile.php?user_id=${userId}`);
        const data = await res.json();

        if (data.success) {
          setProfile(data.user);
        } else {
          setError(data.message || 'Failed to load profile.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An error occurred while loading the profile.');
      }
    };

    fetchProfile();
  }, [userId]);

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</div>;
  }

  if (!profile) {
    return <div style={{ textAlign: 'center', marginTop: '20px' }}><Loading /></div>;
  }

  // Determine the correct image URL based on the profile data
  const profilePicUrl = profile.profile_pic ? `${baseUrl}${profile.profile_pic}` : defaultAvatar;

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      background: '#fff',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src={profilePicUrl}
          alt="avatar"
          width={120}
          height={120}
          style={{
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #007bff'
          }}
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
        <h2 style={{ margin: '15px 0 5px', color: '#333' }}>{profile.username}</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>{profile.email}</p>
        <a 
          href={`mailto:${profile.email}`} 
          style={{
            display: 'inline-block',
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
        >
          Email Me
        </a>
      </div>

      <div style={{ lineHeight: '1.8' }}>
        <p><strong>Full Name:</strong> {profile.first_name} {profile.last_name}</p>
        <p><strong>Country:</strong> {profile.country || 'N/A'}</p>
        <p><strong>Joined:</strong> {profile.created_at || 'N/A'}</p>
        <p><strong>Type of User:</strong> {profile.typeofuser || 'N/A'}</p>
      </div>
    </div>
  );
};

export default UserProfile;