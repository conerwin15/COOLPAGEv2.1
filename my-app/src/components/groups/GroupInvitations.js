import React from "react";
import "./groupdesign/GroupInvitations.css"; // 🎨 custom styles

export default function GroupInvitations({
  pendingInvites,
  sentInvites,
  selectedTab,
  respondToInvite,
}) {
  if (selectedTab === "pending") {
    return (
      <div className="invite-card">
        <h4 className="invite-title">Pending Invitations</h4>

        {pendingInvites.length === 0 ? (
          <p className="invite-empty">No pending invites.</p>
        ) : (
          <div className="invite-list">
            {pendingInvites.map((group) => (
              <div key={group.id} className="invite-item">
                <div className="invite-info">
                  <p className="invite-name">{group.name}</p>
                  <p className="invite-meta">
                    Invited by <span>{group.invited_by}</span>
                  </p>
                  {/* Added group info */}
                  <p className="invite-meta">
                    Group: <span>{group.group_name}</span>
                  </p>
                </div>
                <div className="invite-actions">
                  <button
                    className="btn accept"
                    onClick={() => respondToInvite(group.id, "accept")}
                  >
                    ✔ Accept
                  </button>
                  <button
                    className="btn decline"
                    onClick={() => respondToInvite(group.id, "decline")}
                  >
                    ✖ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedTab === "sent") {
    return (
      <div className="invite-card">
        <h4 className="invite-title">Sent Invitations</h4>

        {sentInvites.length === 0 ? (
          <p className="invite-empty">No invites sent.</p>
        ) : (
          <div className="invite-list">
            {sentInvites.map((invite, i) => (
              <div key={i} className="invite-item">
                <div className="invite-info">
                  <p className="invite-name">{invite.username}</p>
                  <p className="invite-meta">
                    Invited to <span>{invite.group_name}</span>
                  </p>
                </div>
                <div className="invite-status">⏳ Pending</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
