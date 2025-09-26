import React, { useEffect, useState } from "react";
import CreateGroupForm from "./CreateGroupForm";
import GroupList2 from "./GroupList2";
import GroupInvitations from "./GroupInvitations";
import "./groupdesign/groupswrapper.css"

const API_URL = "http://localhost/coolpage/my-app/backend";

export default function Groupswrapper({ user }) {
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [selectedTab, setSelectedTab] = useState("my");

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/get_groups.php?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMyGroups(data.my_groups || []);
        setPublicGroups(data.public_groups || []);
        setPendingInvites(data.pending_invites || []);
        setSentInvites(data.sent_invites || []);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchGroups();
  }, [user]);

  const respondToInvite = async (groupId, action) => {
    try {
      const res = await fetch(`${API_URL}/respond_to_invite.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, user_id: user.id, action }),
      });
      const data = await res.json();
      if (data.success) fetchGroups();
      else alert("❌ " + data.message);
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto" }}>
      <CreateGroupForm user={user} onGroupCreated={fetchGroups} />

     <select
  value={selectedTab}
  onChange={(e) => setSelectedTab(e.target.value)}
  className="group-tabs"
>
  <option value="my">My Groups</option>
  <option value="public">Public Groups</option>
  <option value="pending">Pending Invites</option>
  <option value="sent">Sent Invites</option>
</select>

      <GroupList2
        myGroups={myGroups}
        publicGroups={publicGroups}
        selectedTab={selectedTab}
      />

      <GroupInvitations
        pendingInvites={pendingInvites}
        sentInvites={sentInvites}
        selectedTab={selectedTab}
        respondToInvite={respondToInvite}
      />
    </div>
  );
  
}
