import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../icon/loading";
import "./groupdesign/GroupListPublic.css";

const API_URL = process.env.REACT_APP_API_URL || "";

export default function GroupListPublic({ limit = 1 }) {
  const [publicGroups, setPublicGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/get_groups.php?user_id=1`);
      const data = await res.json();
      if (data.success) {
        setPublicGroups(data.public_groups || []);
      }
    } catch (err) {
      console.error("Error fetching public groups:", err);
    }
  };

  const buildPhotoUrl = (photo) => {
    const fallback = "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png";
    if (!photo) return fallback;
    if (/^https?:\/\//i.test(photo)) return photo;
    const base = API_URL.replace(/\/+$/, "");
    if (photo.startsWith("/")) return base ? `${base}${photo}` : photo;
    if (photo.includes("uploads/")) return base ? `${base}/${photo}` : photo;
    return base ? `${base}/uploads/groups/${photo}` : `/uploads/groups/${photo}`;
  };

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      await fetchPublicGroups();
      setLoading(false);
    };
    loadGroups();
  }, []);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <Loading />
      </div>
    );
  }

  if (!publicGroups.length) {
    return <p className="empty-text">No public groups available.</p>;
  }

  // Limit displayed groups
  const displayGroups = publicGroups.slice(0, limit);

  return (
    
    <div className="group-wrapper">

      <div className="group-list">
        
        {displayGroups.map((g) => {
          const groupName = g.name || g.group_name || "Untitled Group";
          const groupDesc = g.description || g.group_description || "No description provided";
          const photoUrl = buildPhotoUrl(g.group_photos);
 
          return (

            <div className="group-card" key={g.id}>
              <div className="card-image">
                <img
                  src={photoUrl}
                  alt={groupName}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://fms.techtreeglobal.com/assets/uploads/1743233100_key.png")
                  }
                />
              </div>
              <div className="card-content">
                <h3>{groupName}</h3>
                <p>{groupDesc}</p>
          <Link to={`/guest/group/public/${g.id}`} className="details-btn">
                  Click for more details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* See All Groups Link */}
      
    </div>
  );
}