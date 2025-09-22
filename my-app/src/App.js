// src/App.js
import React, { useState, useEffect , onLogin} from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import PostList from './components/PostList';
import PostListAdmin from './components/Useradmin';
import PostForm from './components/PostForm';
import ProfilePost from './components/ProfilePost';
import PostlistGuest from './components/Userguest';
import MyProfilePages from './components/MyProfile';
import About from './components/Aboutus';
import Reallybot from './Logo/Reallybot.png'; // Adjust path if needed
import { m, useIsomorphicLayoutEffect } from 'framer-motion';
import defaultAvatar from './Logo/default-avatar.png';
import PostDetail from './components/Postdetails'; // import the new component
import PublicPostDetail from './components/PublicPostDetail';
import HomeUser from './components/userhome';
import GroupDashboard from './components/groups/GroupDashboard'
import GroupPosts from './components/groups/GroupPosts';
import PublicGroupPage from './components/groups/PublicGroupPage'; // adjust path
import UserProfile from './components/UserProfile'
import PublicGroupPageview from './components/groups/PublicGroupview'
import Guestheader from './components/headers/guestheader'


import { FaGoogle, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

import  GoogleLogin  from './MyGoogleLogin'






    const API_URL= process.env.REACT_APP_API_URL;

const getFullPicUrl = (pic) => {
  if (!pic || typeof pic !== 'string' || pic.trim() === '') {
    return '/Logo/default-avatar.png'; // fallback to default
  }

  return pic.startsWith('http')
    ? pic
    : `${API_URL}/uploads/${pic.replace(/^\/+/, '')}`;
};






function AppWrapper() {
  
  return (
   <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <MainApp />
      </div>
 </BrowserRouter>
  );
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('forumUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const refreshPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/get_posts.php`);
      const data = await res.json();
      if (data.success) setPosts(data.posts);
      else console.error('Backend error:', data.message);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' && window.location.pathname === '/') {
      navigate('/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchLikes = async () => {
      try {
        const res = await fetch(
          `${API_URL}/get_likes.php?user_id=${user.id}`
        );
        const data = await res.json();
        if (data.success) {
          setLikes(data.total_likes || {});
          setUserLiked(data.user_liked || {});
        } else {
          console.warn('Failed to load like data');
        }
      } catch (err) {
        console.error('Error fetching likes:', err.message);
      }
    };

    fetchLikes();
  }, [user?.id, posts]);

  const handleLike = async (targetId, type = 'post') => {
    if (!user?.id) {
      alert('Please login to like');
      return;
    }
    const key = `${type}_${targetId}`;
    const liked = userLiked[key];
    const url = liked ? 'unlike.php' : 'like.php';

    try {
      const res = await fetch(`${API_URL}/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          user_id: user.id,
          target_id: targetId,
          target_type: type,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setLikes((prev) => ({
          ...prev,
          [key]: liked ? Math.max(0, (prev[key] || 1) - 1) : (prev[key] || 0) + 1,
        }));

        setUserLiked((prev) => ({
          ...prev,
          [key]: !liked,
        }));
      } else {
        if (!liked && data.message !== 'Already liked') {
          alert(data.message || 'Like failed');
        }
      }
    } catch (err) {
      console.error('Like/unlike request failed:', err.message);
      alert('Network error: ' + err.message);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('forumUser', JSON.stringify(userData));
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('forumUser');
    setUser(null);
    navigate('/');
  };

return (
  <div style={{ flex: 1 }}>
    <Routes>
      <Route
        path="/login"
        element={
          !user ? (
            <div>
              {/* 🔹 Header Section */}
              <header
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(173, 216, 230, 0.3)",
                  padding: "10px 20px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={Reallybot}
                    alt="Really Lesson Logo"
                    style={{ height: "50px", marginRight: "10px" }}
                  />
                
                </div>
              </header>

              {/* 🔹 Login Section */}
              <div style={styles.welcomeContainer}>
                <div style={styles.welcomeHeader}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                   
                  </div>
                  <h1 style={styles.welcomeTitle}>
                    Welcome to the Community of Online Learners
                  </h1>
                  <p style={styles.welcomeSubtitle}>
                    Connect. Share. Learn Together.
                  </p>
                </div>
                <div style={styles.loginSection}>
                  <Login onLogin={handleLogin} />
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />





    {/* other routes */}




<Route
  path="/group/:groupId"
  element={
    user ? (
      <GroupPage
        user={user}
        posts={posts}
        onRefresh={refreshPosts}
        onLike={handleLike}
        likes={likes}
        userLiked={userLiked}
        onLogout={handleLogout}
        navigateToProfile={() => navigate('/profile')}
      />
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>

<Route
  path="/guest/group/public/:groupId"
  element={
    <div>
      {/* 🔹 Header Section */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(173, 216, 230, 0.3)",
          padding: "10px 20px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={Reallybot}
            alt="Really Lesson Logo"
            style={{ height: "50px", marginRight: "10px" }}
          />
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
      
          </div>
        </div>
      </header>

      {/* 🔹 Page content */}
      <PublicGroupPageview />
    </div>
  }
/>





<Route path="/profile/:userId" element={<UserProfile />} />

<Route
  path="/group/public/:groupId"
  element={
    user ? (
      <GroupPage
        user={user}
        posts={posts}
        onRefresh={refreshPosts}
        onLike={handleLike}
        likes={likes}
        userLiked={userLiked}
        onLogout={handleLogout}
        navigateToProfile={() => navigate('/profile')}
      />
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>




  <Route
    path="/home"
    element={
      user ? (
        <UserHome
          user={user}
          posts={posts}
          onRefresh={refreshPosts}
          onLike={handleLike}
          likes={likes}
          userLiked={userLiked}
          onLogout={handleLogout}
          navigateToProfile={() => navigate('/profile')}
        />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />

  {/* ✅ Add Post Detail Route */}
   <Route
  path="/home/post/:id"
  element={
    user ? (
      <div>
        {/* 🔹 Header Section */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(173, 216, 230, 0.3)',
            padding: '10px 20px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={Reallybot}
              alt="Really Lesson Logo"
              style={{ height: '50px', marginRight: '10px' }}
            />

          </div>
        </header>

        {/* 🔹 Post detail content */}
        <PostDetail
          user={user}
          posts={posts}
          onRefresh={refreshPosts}
          onLike={handleLike}
          likes={likes}
          userLiked={userLiked}
          onLogout={handleLogout}
          navigateToProfile={() => navigate('/profile')}
        />
      </div>
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>

<Route
    path="/home/post/:id"
    element={
      user ? (
        <PostDetail
          user={user}
          posts={posts}
          onRefresh={refreshPosts}
          onLike={handleLike}
          likes={likes}
          userLiked={userLiked}
          onLogout={handleLogout}
          navigateToProfile={() => navigate('/profile')}
        />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />


<Route
  path="/home/public/:id"
  element={
    <div>
      {/* 🔹 Header Section */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(173, 216, 230, 0.3)',
          padding: '10px 20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={Reallybot}
            alt="Really Lesson Logo"
            style={{ height: '50px', marginRight: '10px' }}
          />
     
        </div>
      </header>

      {/* 🔹 Public post detail content */}
      <PublicPostDetail
        user={user}
        posts={posts}
        onRefresh={refreshPosts}
        onLike={handleLike}
        likes={likes}
        userLiked={userLiked}
        onLogout={handleLogout}
      />
    </div>
  }
/>










      <Route
        path="/admin"
        element={
          user?.role === 'admin' ? (
            <AdminPanel
              user={user}
              posts={posts}
              onRefresh={refreshPosts}
              onLike={handleLike}
              likes={likes}
              userLiked={userLiked}
              onLogout={handleLogout}
              navigateToProfile={() => navigate('/profile')}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

     <Route
  path="/"
  element={
    user ? (
      <Navigate to="/home" replace />
      
    ) : (
  
      <div style={{ }}>
            <Guestheader />

 
        <PostlistGuest />
      </div>
    )
  }
/>

      <Route
        path="/profile"
        element={
          user ? (
            <ProfilePage
              user={user}
              onLogout={handleLogout}
              navigateToHome={() => navigate('/home')}
              onRefresh={refreshPosts}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

<Route
  path="/aboutus"
  element={
    user ? (
      <Aboutcool
        user={user}
        onLogout={handleLogout}
        navigateToHome={() => navigate('/home')}
       navigateToProfile={() => navigate('/profile')}
        onRefresh={refreshPosts}
      />
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>  {/* âœ… self-closing tag */}

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/home"
        element={
          user ? (
            <UserHome
              user={user}
              posts={posts}
              onRefresh={refreshPosts}
              onLike={handleLike}
              likes={likes}
              userLiked={userLiked}
              onLogout={handleLogout}
              navigateToProfile={() => navigate('/profile')}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />


     <Route
  path="/myprofileinfo"
  element={
     user?(
      <MyProfilePage
        user={user}
        posts={posts}
        onRefresh={refreshPosts}
        onLike={handleLike}
        likes={likes}
        userLiked={userLiked}
        onLogout={handleLogout}
        navigateToProfile={() => navigate('/profile')}
      />
    ) : (
      <Navigate to="/login" replace />  // âœ… Proper fallback
    )
  }
/>

    </Routes>
  </div>
);


}


function Aboutcool({ user,
  posts,
  onRefresh,
  onLike,
  likes,
  userLiked,
  onLogout,
  navigateToProfile, }) {
  const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = React.useState(false);
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };
 return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
          padding: '10px 20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={Reallybot}
            alt="Logo"
            style={{ height: 40, marginRight: 12 }}
          />
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#004d70' }}></h2>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
  onClick={toggleDropdown}
  style={{
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#004d70',
    fontWeight: 'bold',
    userSelect: 'none',
   
  }}
>

 <img
  src={getFullPicUrl(user?.profile_pic)}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }}
  alt="avatar"
  style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '8px',
        marginLeft: '8px',
  }}
/>
 <i className="fa fa-caret-down" style={{ marginLeft: '8px', marginRight:'10px' }}></i>
</div>

          {showDropdown && (
            <div
              style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginTop: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      width: '250px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}
            >

               <div
  onClick={() => {
    setShowDropdown(false);
    if (user?.role === "admin") {
      navigate("/admin"); // ✅ admin goes here
    } else {
      navigate("/home");   // ✅ normal user goes here
    }
  }}
  style={{
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  }}
>
  <i className="fa fa-home" style={{ marginRight: 6 }}></i>
  Home
</div>



<div
                onClick={() => {
                  setShowDropdown(false);
           navigate('/myprofileinfo');
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                <i className="fa fa-user" style={{ marginRight: 6 }}></i>
                My Profile
              </div>
              
              <div
                onClick={() => {
                  setShowDropdown(false);
                 
                    navigateToProfile();
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                <i className="	fa fa-file-alt" style={{ marginRight: 6 }}></i>
                My Post
              </div>




             
              
              <div
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-sign-out-alt" style={{ marginRight: 6 }}></i>
                Logout
              </div>
            </div>
          )}
        </div>
      </header>

      <section style={{ padding: '20px' }}>
        <About/>
      </section>
    </div>
  );
}

function MyProfilePage({  user,
  posts,
  onRefresh,
  onLike,
  likes,
  userLiked,
  onLogout,
  navigateToProfile, }) {
 const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = React.useState(false);
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };
 return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
     <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
          padding: '10px 20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={Reallybot}
            alt="Logo"
            style={{ height: 40, marginRight: 12 }}
          />
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#004d70' }}></h2>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
  onClick={toggleDropdown}
  style={{
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#004d70',
    fontWeight: 'bold',
    userSelect: 'none',
  }}
>
 <img
  src={getFullPicUrl(user?.profile_pic)}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }}
  alt="avatar"
  style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '8px',
  }}
/>
 <i className="fa fa-caret-down" style={{ marginLeft: '8px', marginRight:'10px'}}></i>
</div>

          {showDropdown && (
            <div
            style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginTop: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      width: '240px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}
            >  <div
  onClick={() => {
    setShowDropdown(false);
    if (user?.role === "admin") {
      navigate("/admin"); // ✅ admin goes here
    } else {
      navigate("/home");   // ✅ normal user goes here
    }
  }}
  style={{
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  }}
>
  <i className="fa fa-home" style={{ marginRight: 6 }}></i>
  Home
</div>




              
              <div
                onClick={() => {
                  setShowDropdown(false);
                 
                 navigate('/profile');
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                <i className="	fa fa-file-alt" style={{ marginRight: 6 }}></i>
                My Post
              </div>




              <div
                onClick={() => {
                  setShowDropdown(false);
                navigate("/aboutus")
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-question-circle" style={{ marginRight: 6 }}></i>
              About us
              </div>


              
              <div
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-sign-out-alt" style={{ marginRight: 6 }}></i>
                Logout
              </div>
            </div>
          )}
        </div>
      </header>

      <section style={{ padding: '20px' }}>
        <MyProfilePages />
      </section>
    </div>
  );
}


function UserHome({
  user,
  posts,
  onRefresh,
  onLike,
  likes,
  userLiked,
  onLogout,
  navigateToProfile,
}) {
const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = React.useState(false);
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };
 return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
       <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
          padding: '10px 20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={Reallybot}
            alt="Logo"
            style={{ height: 40, marginRight: 12 }}
          />
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#004d70' }}></h2>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
  onClick={toggleDropdown}
  style={{
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#004d70',
    fontWeight: 'bold',
    userSelect: 'none',
  }}
>
    <img
  src={getFullPicUrl(user?.profile_pic)}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }}
  alt="avatar"
  style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '8px',
  }}
/>
 <i className="fa fa-caret-down" style={{ marginLeft: '8px', marginRight:'10px' }}></i>
  
</div>

          {showDropdown && (
            <div
               style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginTop: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      width: '240px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}
            >
<div
                onClick={() => {
                  setShowDropdown(false);
           navigate('/myprofileinfo');
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                <i className="fa fa-user" style={{ marginRight: 6 }}></i>
                My profile
              </div>
              
              <div
                onClick={() => {
                  setShowDropdown(false);
                 
                          navigateToProfile();
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                <i className="	fa fa-file-alt" style={{ marginRight: 6 }}></i>
                My Post
              </div>




              <div
                onClick={() => {
                  setShowDropdown(false);
                navigate("/aboutus")
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-question-circle" style={{ marginRight: 6 }}></i>
              About us
              </div>


              
              <div
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-sign-out-alt" style={{ marginRight: 6 }}></i>
                Logout
              </div>
            </div>
          )}
        </div>
      </header>

    {/**     <PostForm onSubmit={onRefresh} user={user} />*/}  <section style={styles.postFormSection}>
    
      </section>

      <section style={styles.postListSection}>
        <HomeUser
          posts={posts}
          user={user}
          likes={likes}
          userLiked={userLiked}
          onLike={onLike}
          onRefresh={onRefresh}
        />
      </section>
    </div>
  );
}



function GroupPage({groupId,
  user,
  posts,
  onRefresh,
  onLike,

  onLogout,
  navigateToProfile,
}) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const toggleDropdown = () => setShowDropdown(prev => !prev);

  return (
    <div style={{ width: '100%', margin: 0, padding: 0, fontFamily: 'Segoe UI, sans-serif' }}>
     <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
          padding: '10px 20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={Reallybot}
            alt="Logo"
            style={{ height: 40, marginRight: 12 }}
          />
       
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={toggleDropdown}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#007c91',
              fontWeight: 'bold',
              userSelect: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#b2ebf2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <img
              src={getFullPicUrl(user?.profile_pic)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
              alt="avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '8px',
              }}
            />
        
            <i className="fa fa-caret-down" style={{ marginLeft: '8px', marginRight: '10px' }}></i>
          </div>

          {showDropdown && (
            <div
             style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginTop: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      width: '240px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}
            >
              {[
                { label: 'My Profile', icon: 'fa-user', onClick: () => navigate('/myprofileinfo') },
                { label: 'My Posts', icon: 'fa-file-alt', onClick: navigateToProfile },
                { label: 'About Us', icon: 'fa-question-circle', onClick: () => navigate('/aboutus') },
                { label: 'Logout', icon: 'fa-sign-out-alt', onClick: onLogout }
              ].map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setShowDropdown(false);
                    item.onClick();
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < 3 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <i className={`fa ${item.icon}`} style={{ marginRight: 10, width: 18 }}></i>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <section style={styles.postFormSection}>
 </section>

      <section style={styles.postListSection}>
        <GroupDashboard    groupId={groupId}
        user={user}
        posts={posts}
              
 />
      </section>
    </div>
  );
}




function AdminPanel({ user, posts, onRefresh, onLike, likes, userLiked, navigateToProfile, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const dropdownItemStyle = {
    padding: '10px 20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#333',
    backgroundColor: '#fff',
    transition: 'background-color 0.3s, color 0.3s',
    borderBottom: '1px solid #eee',
    fontSize: '0.95rem',
  };

  const dropdownHoverStyle = {
    backgroundColor: '#f0f8ff',
    color: '#0077b6',
  };

  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
     <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
          padding: '10px 20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={Reallybot}
            alt="Logo"
            style={{ height: 40, marginRight: 12 }}
          />
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={toggleDropdown}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#004d70',
              fontWeight: 'bold',
              userSelect: 'none',
            }}
          >
            <img
  src={getFullPicUrl(user?.profile_pic)}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }}
  alt="avatar"
  style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '8px',
  }}
/>
          <i className="fa fa-caret-down" style={{ marginLeft: '8px', marginRight:'10px' }}></i>
          </div>

          {showDropdown && (
            <div
             style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginTop: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      width: '240px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}
            >
              <div
                onClick={() => {
                  setShowDropdown(false);
                  navigateToProfile();
                }}
                onMouseEnter={() => setHoveredItem('post')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...dropdownItemStyle,
                  ...(hoveredItem === 'post' ? dropdownHoverStyle : {}),
                }}
              >
                <i className="fa fa-file-alt" style={{ marginRight: 8 }}></i>
                My Post
              </div>

              <div
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/myprofileinfo');
                }}
                onMouseEnter={() => setHoveredItem('profile')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...dropdownItemStyle,
                  ...(hoveredItem === 'profile' ? dropdownHoverStyle : {}),
                }}
              >
                <i className="fa fa-user" style={{ marginRight: 8 }}></i>
                My Profile
              </div>

              <div
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...dropdownItemStyle,
                  ...(hoveredItem === 'logout' ? dropdownHoverStyle : {}),
                }}
              >
                <i className="fa fa-sign-out-alt" style={{ marginRight: 8 }}></i>
                Logout
              </div>
            </div>
          )}
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        <section style={{ marginBottom: '24px' }}>
          {/* <PostForm onSubmit={onRefresh} user={user} /> */}
        </section>

        <section>
          <PostListAdmin
            posts={posts}
            user={user}
            likes={likes}
            userLiked={userLiked}
            onLike={onLike}
            onRefresh={onRefresh}
          />
        </section>
      </main>
    </div>
  );
}

function ProfilePage({ user, posts, onLogout, navigateToHome, onRefresh }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };
const navigate = useNavigate();
 return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
        <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
          padding: '10px 20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={Reallybot}
            alt="Logo"
            style={{ height: 40, marginRight: 12 }}
          />
       
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={toggleDropdown}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#004d70',
              fontWeight: 'bold',
              userSelect: 'none',
            }}
          >
      <img
  src={getFullPicUrl(user?.profile_pic)}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }}
  alt="avatar"
  style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '8px',
  }}
/>
   <i className="fa fa-caret-down" style={{ marginLeft: '8px', marginRight: '10px'  }}></i>
          </div>

          {showDropdown && (
            <div
            style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginTop: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      width: '240px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}
            >

<div
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/myprofileinfo');
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                <i className="fa fa-user" style={{ marginRight: 6 }}></i>
              My Profile
              </div>

            {/* Dropdown Menu */}
           <div
  onClick={() => {
    setShowDropdown(false);
    if (user?.role === "admin") {
      navigate("/admin"); // ✅ admin goes here
    } else {
      navigateToHome();   // ✅ normal user goes here
    }
  }}
  style={{
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  }}
>
  <i className="fa fa-home" style={{ marginRight: 6 }}></i>
  Home
</div>

<div
  onClick={() => {
    setShowDropdown(false);
    navigate("/aboutus");
  }}
  style={{
    padding: "10px 20px",
    cursor: "pointer",
  }}
>
  <i className="fa fa-question-circle" style={{ marginRight: 6 }}></i>
  About us
</div>



              <div
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-sign-out-alt" style={{ marginRight: 6 }}></i>
                Logout
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Post Form 
      
      <section style={{ padding: '20px' }}>
        <PostForm onSubmit={onRefresh} user={user} />
      </section>*/}
      

      {/* Profile Posts Section */}
      <section style={styles.profileSection}>
        <ProfilePost user={user} />
      </section>
    </div>
  );
}








const styles = {
  welcomeContainer: {
    textAlign: 'center',
    padding: '20px 1px',
    backgroundColor: 'white',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeHeader: {
    marginBottom: 1,
  },
  logoLarge: {
    height: 40,
    marginBottom: 1,
  },
  welcomeTitle: {
    fontSize: '20px',
    color: '#0077b6',
    margin: 0,
  },
  welcomeSubtitle: {
    fontSize: '15px',
    color: '#555',
  },
  loginSection: {
    width: '50%',
    maxWidth: 500,
  },
  container: {
    maxWidth: '100%',
    margin: '20px auto',
    

  },
  header: {
  maxWidth:'100%',                // Full viewport width
          // Sticks to the top
  top: 0,
  left: 0,
  zIndex: 1000,                  // Ensures it's on top
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 15px',
  backgroundColor: 'lightblue', // Header background color
  width: '100%',                // Full width
         // Fixed position
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Optional shadow
},
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logoSmall: {
    height: 30,
  },
  rightHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  username: {
    color: '#0077b6',
    fontWeight: 700,
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#0077b6',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s',
  },
  postFormSection: {},
  postListSection: {},
  profileSection: {
    marginTop: 20,
  },
  adminContainer: {
    display: 'flex',
    minHeight: '50vh',
  },
  adminMain: {
    maxWidth: '100%',
    flex: 1,
    padding: '20px 30px',
  },
};

export default AppWrapper;
