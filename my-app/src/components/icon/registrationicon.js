import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

const RegisterButton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: "pointer",
        color: "#0077b6", // fixed: removed extra quotes
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "8px",

        userSelect: "none",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#0077b6";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#0077b6";
      }}
    >
      <FontAwesomeIcon icon={faUserPlus} />
   
    </div>
  );
};

export default RegisterButton;
