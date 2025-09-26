import React from "react";
import { Link } from "react-router-dom";
import "./groupdesign/ListofGroup.css";

const API_URL = process.env.REACT_APP_API_URL || ""; // e.g. "http://localhost/coolpage/my-app/backend"

export default function ListofGroup({ myGroups = [], publicGroups = [], selectedTab }) {
  const buildPhotoUrl = (photo) => {
    const fallback = "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png";
    if (!photo) return fallback;

    // already a full URL?
    if (/^https?:\/\//i.test(photo)) return photo;

    // remove trailing slash from API_URL if present
    const base = API_URL.replace(/\/+$/, "");

    // if photo already includes 'uploads' or starts with a slash, attach to base
    if (photo.startsWith("/")) {
      // photo = "/uploads/groups/abc.jpg" -> base + photo
      return base ? `${base}${photo}` : photo;
    }
    if (photo.includes("uploads/")) {
      return base ? `${base}/${photo}` : photo;
    }

    // otherwise assume it's a filename stored under uploads/groups/
    return base ? `${base}/uploads/groups/${photo}` : `/uploads/groups/${photo}`;
  };

  const renderGroupCard = (g, isPublic = false) => {
    const groupName = g.name || g.group_name || "Untitled Group";
    const groupDesc = g.description || g.group_description || "No description provided";
    const photoUrl = buildPhotoUrl(g.group_photos);

    return (
      <div className="group-card" key={g.id}>
        {/* Top Image */}
        <div className="card-image">
          <img src={photoUrl} alt={groupName} onError={(e) => {
            // fallback if image fails to load
            e.currentTarget.src = "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png";
          }} />
        </div>

        {/* Content */}
        <div className="card-content">
          <h3>{groupName}</h3>
          <p>{groupDesc}</p>

          {/* Details button */}
          <Link
            to={isPublic ? `/group/public/${g.id}` : `/group/${g.id}`}
            className="details-btn"
          >
            Click for more details
          </Link>
        </div>
      </div>
    );
  };

  if (selectedTab === "my") {
    return myGroups.length === 0 ? (
      <p>No groups created.</p>
    ) : (
      <div className="group-list">{myGroups.map((g) => renderGroupCard(g))}</div>
    );
  }

  if (selectedTab === "public") {
    return publicGroups.length === 0 ? (
      <p>No public groups available.</p>
    ) : (
      <div className="group-list">{publicGroups.map((g) => renderGroupCard(g, true))}</div>
    );
  }

  return null;
}
