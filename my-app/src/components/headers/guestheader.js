import { useState } from "react";
import { Menu, X } from "lucide-react"; // icons
import Reallybot from './Reallybot.png'; // Adjust path if needed
import GoogleLogin from './googleLogin';
import Login from '../icon/loginicon'
import Registericon from "../icon/registrationicon";
import Gicon from "../icon/googleicon"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="header-container">
      <header className="header">
        {/* Logo */}
        <div className="logo">
          <img
            src={Reallybot}
            alt="Really Lesson Logo"
            style={{ height: "50px", marginRight: "10px" }}
          />
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {/* Branding text */}
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="desktop-menu">
        <GoogleLogin />
          <button
            onClick={() => (window.location.href = "/login")}
            style={buttonStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
          <Login />  Login
          </button>
          <button
            onClick={() => (window.location.href = "/register")}
            style={buttonStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
         <Registericon />   Register
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-menu">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "28px",
              color: "#0077b6",
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="mobile-dropdown">
          <GoogleLogin />
          <button
            onClick={() => (window.location.href = "/login")}
            style={buttonStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
           <Login /> Login
          </button>
          <button
            onClick={() => (window.location.href = "/register")}
            style={buttonStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            <Registericon />    Register
          </button>
        </div>
      )}

      {/* CSS */}
      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: rgba(173, 216, 230, 0.3);
          padding: 10px 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          width: 100%;
        }
        .logo {
          display: flex;
          align-items: center;
        }
        .desktop-menu {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .mobile-menu {
          display: none;
        }
        .mobile-dropdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background-color: white;
          padding: 15px 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Mobile Rules */
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

// Reusable button style
const buttonStyle = {
display: "flex",
  alignItems: "center",
  justifyContent: "center", // ✅ centers content inside the button
  gap: "3px",
  backgroundColor: "transparent",
  color: "#0077b6",
  border: "none",
  borderRadius: "6px",
  padding: "5px 15px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.3s ease",
};

// Hover effect helpers
function hoverIn(e) {
  e.currentTarget.style.backgroundColor = "#0077b6";
  e.currentTarget.style.color = "#fff";
}
function hoverOut(e) {
  e.currentTarget.style.backgroundColor = "transparent";
  e.currentTarget.style.color = "#0077b6";
}
