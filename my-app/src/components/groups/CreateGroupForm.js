import React, { useState } from "react";
import "./groupdesign/CreateGroupForm.css"; // 🎨 we’ll style separately
const API_URL = process.env.REACT_APP_API_URL;

export default function CreateGroupForm({ user, onGroupCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const toggleForm = () => setShowForm(!showForm);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setMessage("⚠️ Group name is required.");
      setMessageType("warning");
      return;
    }

    if (!user?.id) {
      setMessage("❌ You must be logged in to create a group.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("description", description);
      formData.append("visibility", visibility);
      formData.append("created_by", user.id);
      if (groupPhoto) formData.append("group_photos", groupPhoto);

      const res = await fetch(`${API_URL}/create_group.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setMessageType("success");
        setGroupName("");
        setDescription("");
        setVisibility("public");
        setGroupPhoto(null);
        setShowForm(false); // hide after success
        onGroupCreated?.();
      } else {
        setMessage(`❌ ${data.message}`);
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network or server error.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-group-wrapper">
      <button className="toggle-btn" onClick={toggleForm}>
        {showForm ? "✖ Cancel" : "+ Create Group"}
      </button>

      {showForm && (
        <div className="form-card">
          <h3>Create a New Group</h3>

          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="input-field"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description (optional)"
            rows={3}
            className="input-field"
          />

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="input-field"
          >
            <option value="public">🌍 Public</option>
            <option value="private">🔒 Private</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setGroupPhoto(e.target.files[0])}
            className="input-field"
          />

          <button
            onClick={handleCreateGroup}
            disabled={submitting}
            className={`submit-btn ${submitting ? "disabled" : ""}`}
          >
            {submitting ? "Submitting..." : "Submit Group"}
          </button>

          {message && (
            <div className={`message ${messageType}`}>{message}</div>
          )}
        </div>
      )}
    </div>
  );
}
