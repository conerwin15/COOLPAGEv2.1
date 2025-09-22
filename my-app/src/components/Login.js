import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // --- Normal login ---


    const URL= process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${URL}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password }).toString(),
      });

      const data = await res.json();

      if (data.success && data.user) {
        const user = data.user;
        localStorage.setItem("forumUser", JSON.stringify(user));
        localStorage.setItem("userEmail", user.email);

        if (user.role === "admin") {
          window.location.href = "/admin";
        } else {
          onLogin(user);
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Error: " + error.message);
    }
  };

  // --- Google login ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google user decoded:", decoded);

      // Send decoded Google user info to backend
      const res = await fetch(`${URL}/google-login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          google_id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          avatar: decoded.picture,
        }).toString(),
      });

      const data = await res.json();

      if (data.success && data.user) {
        const user = data.user;
        localStorage.setItem("forumUser", JSON.stringify(user));
        localStorage.setItem("userEmail", user.email);
        onLogin(user);
      } else {
        alert(data.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
  <div
style={{
  margin: "10 auto",
  width: "100%",
  padding: window.innerWidth <= 768 
    ? "20px 10px 10px 10px"   // mobile padding
    : "20px 80px 40px 80px", // desktop padding
  background: window.innerWidth <= 768 ? 'none':"#e6f2ff",

  // ✅ Responsive border radius
  borderRadius: window.innerWidth <= 768 ? "0px" : "16px",

  // ✅ Responsive shadow
  boxShadow: window.innerWidth <= 768 
    ? "none" 
    : "0 8px 16px rgba(0, 123, 255, 0.15)",

  // ✅ Responsive border
  border: window.innerWidth <= 768 
    ? "none" 
    : "1px solid #b3d7ff",

  boxSizing: "border-box",
}}
>


      
      <h2 style={{ textAlign: "center", marginBottom: 25, color: "#0056b3" }}>
        Login
      </h2>

      {/* Normal login form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#003d80" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #99c2ff",
              borderRadius: 6,
              background: "#fff",
            }}
          />
        </div>
        <div style={{ marginBottom: 25 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#003d80" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #99c2ff",
              borderRadius: 6,
              background: "#fff",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 14,
            background: "#007bff",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      {/* Google login button */}
     <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
    width :'100%'
  }}
>
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => console.log("Google login failed")}
  />
</div>

      <p style={{ textAlign: "center", marginTop: 20, color: "#003d80" }}>
        Don’t have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          Register here
        </button>
      </p>

      <p style={{ textAlign: "center", marginTop: 10, color: "#003d80" }}>
        Or{" "}
        <Link to="/" style={{ color: "#007bff", fontWeight: "bold" }}>
          Visit the forum without login
        </Link>
      </p>
    </div>
  );
};

export default Login;
