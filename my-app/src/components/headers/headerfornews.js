import React, { useState } from "react";
import Reallybot from './Reallybot.png'; // Adjust path if needed

export default function Header() {
  return (
    <div className="header-container">
      <header className="header">
        {/* Logo */}
        <div className="logo">
          <img
            src={Reallybot}
            alt="Really Lesson Logo"
            style={{ height: "50px" }}
          />
        </div>

        {/* Contact Us 
        <div className="contact-us">
          <button
            onClick={() => window.location.href = "/contact"}
            style={buttonStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            Contact Us
          </button>
        </div>*/}
      </header>

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
        .contact-us {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

// Reusable button style
const buttonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "3px",
  backgroundColor: "#0077b6",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "5px 15px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.3s ease",
};

// Hover effect helpers
function hoverIn(e) {
  e.currentTarget.style.backgroundColor = "#005f8a";
}

function hoverOut(e) {
  e.currentTarget.style.backgroundColor = "#0077b6";
}
