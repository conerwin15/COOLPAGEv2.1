<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require 'db.php';

if (!isset($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User ID missing']);
    exit;
}

$user_id = intval($_GET['user_id']);

$stmt = $conn->prepare("SELECT id, username, first_name, last_name, email, profile_pic FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    // Determine full profile picture URL
    if (!empty($user['profile_pic'])) {
        if (stripos($user['profile_pic'], 'http') === 0) {
            // Google or external URL
            $user['profile_pic'] = $user['profile_pic'];
        } else {
            // Local upload
            $user['profile_pic'] = "http://localhost/coolpage/my-app/backend/uploads/" . $user['profile_pic'];
        }
    } else {
        // Default avatar
        $user['profile_pic'] = "http://localhost/coolpage/my-app/backend/default-avatar.png";
    }

    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>
