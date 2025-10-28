// MyGoogleLogin.js
import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
  const API_URL= process.env.REACT_APP_API_URL;
const MyGoogleLogin = ({ onLogin }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google token:", tokenResponse);

        // Get user info from Google API
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userInfo = await userInfoRes.json();
        console.log("Google user:", userInfo);

        // Send user info to your backend
        const res = await fetch(`${API_URL}/google-login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            google_id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
          }).toString(),
        });

        const data = await res.json();

        if (data.success && data.user) {
          const user = data.user;

          localStorage.setItem("forumUser", JSON.stringify(user));
          localStorage.setItem("userEmail", user.email);

          if (onLogin) onLogin(user);

          window.location.href = "/";
        } else {
          alert(data.message || "Google login failed");
        }
      } catch (err) {
        console.error("Google login failed:", err);
      }
    },
    onError: () => console.log("Google login failed"),
  });

  return (
    <button
      onClick={() => login()}
      style={{
        backgroundColor: "transparent",
        color: "#0077b6",
        border: "1px solid #0077b6",
        borderRadius: "6px",
        padding: "8px 20px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google logo"
        style={{ width: "20px", height: "20px" }}
      />
      Sign in with Google
    </button>
  );
};

export default MyGoogleLogin;
