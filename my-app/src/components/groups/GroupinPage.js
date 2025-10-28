import React, { useEffect, useState } from "react";
import GroupList2 from "./GroupList2"; // your group card component
import "./groupdesign/groupswrapper.css";

const API_URL = "http://localhost/coolpage/my-app/backend";

export default function AllGroupsPage() {
  const [user, setUser] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user", err);
      }
    }
  }, []);

  // Fetch all groups
  const fetchGroups = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/get_groups.php?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMyGroups(data.my_groups || []);
        setPublicGroups(data.public_groups || []);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchGroups();
  }, [user]);

  if (!user) return <p style={{ textAlign: "center", marginTop: "20px" }}>Please log in</p>;
  if (loading) return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading groups...</p>;

  // Combine all groups for display
  const allGroups = [...myGroups, ...publicGroups];

  return (
    <div style={{ maxWidth: "700px", margin: "auto" }}>
      <h2 style={{ marginBottom: "15px" }}>All Groups</h2>
      {allGroups.length > 0 ? (
        <GroupList2
          myGroups={allGroups}
          publicGroups={allGroups}
          selectedTab="all"
        />
      ) : (
        <p style={{ textAlign: "center" }}>No groups available.</p>
      )}
    </div>
  );
}
