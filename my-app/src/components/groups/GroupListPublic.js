import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../icon/loading";

const GroupListPublic = () => {
  const [publicGroups, setPublicGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPublicGroups = async () => {
    try {
      const res = await fetch(
        `http://localhost/coolpage/my-app/backend/get_groups.php?user_id=1`
      );
      const data = await res.json();
      if (data.success) {
        setPublicGroups(data.public_groups || []);
      }
    } catch (err) {
      console.error("Error fetching public groups:", err);
    }
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
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Public Groups
      </h4>

      {publicGroups.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "5px",
          }}
        >
          {publicGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/guest/group/public/${group.id}`)}
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #eee",
                padding: "15px",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <h5 style={{ fontSize: "14px", marginBottom: "10px" }}>{group.name}</h5>
              <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
                {group.description || "No description available."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No public groups available.</p>
      )}
    </div>
  );
};

export default GroupListPublic;
