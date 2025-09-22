import React, { useEffect, useState } from "react";

const API_URL = "http://localhost/coolpage/my-app/backend/admin_user_management.php";

const AdminUserPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [password, setPassword] = useState("");

  // 🔁 Load users
  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "get_users" }),
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 📝 Handle select user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData(user);
  };

  // 📝 Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Update Info
  const updateInfo = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "update_info", ...formData }),
      });
      const data = await res.json();
      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Update Password
  const updatePassword = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "update_password", id: selectedUser.id, password }),
      });
      const data = await res.json();
      alert(data.message);
      setPassword("");
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ Delete Account
  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "delete", id: selectedUser.id }),
      });
      const data = await res.json();
      alert(data.message);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* Users List */}
      <div style={{ width: "250px", borderRight: "1px solid #ddd" }}>
        <h3>All Users</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((u) => (
            <li
              key={u.id}
              style={{
                padding: "8px",
                marginBottom: "5px",
                cursor: "pointer",
                background: selectedUser?.id === u.id ? "#eef3f8" : "#f9f9f9",
              }}
              onClick={() => handleSelectUser(u)}
            >
              {u.username} ({u.typeofuser})
            </li>
          ))}
        </ul>
      </div>

      {/* User Edit Form */}
      {selectedUser && (
        <div style={{ flex: 1 }}>
          <h3>Edit User: {selectedUser.username}</h3>
          <div style={{ display: "grid", gap: "10px", maxWidth: "400px" }}>
            <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" />
            <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" />
            <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
            <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
            <input name="typeofuser" value={formData.typeofuser} onChange={handleChange} placeholder="User Type" />
            <input name="profile_pic" value={formData.profile_pic} onChange={handleChange} placeholder="Profile Pic URL" />

            <button onClick={updateInfo} style={{ background: "#2ecc71", color: "white", padding: "10px" }}>
              Save Info
            </button>
          </div>

          {/* Password Update */}
          <h4 style={{ marginTop: "20px" }}>Change Password</h4>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
          />
          <button onClick={updatePassword} style={{ marginLeft: "10px", background: "#3498db", color: "white", padding: "10px" }}>
            Update Password
          </button>

          {/* Delete Account */}
          <div style={{ marginTop: "20px" }}>
            <button onClick={deleteAccount} style={{ background: "#e74c3c", color: "white", padding: "10px" }}>
              Delete Account!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserPanel;  