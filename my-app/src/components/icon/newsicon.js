import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";
import Newspost from "../whatisnew/news"; // make sure path is correct

const NewsIcon = () => {
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  return (
    <div>
      {/* News Icon */}
      <div
        onClick={toggleForm}
        style={{
          display: "inline-flex",
          alignItems: "center",
          cursor: "pointer",
          fontSize: "25px",
          padding: "8px",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          color: showForm ? "#007bff" : "#000", // active = blue
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "#f0f2f5")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
      >
        <FontAwesomeIcon icon={faNewspaper} />
      </div>

     
    </div>
  );
};

export default NewsIcon;
