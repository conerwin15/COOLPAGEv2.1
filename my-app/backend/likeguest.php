<?php
// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    exit(0);
}

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST");
header("Content-Type: application/json");

require 'db.php'; // DB connection

// Get request data
$method = $_SERVER['REQUEST_METHOD'];
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0; // optional
$ip_address = $_SERVER['REMOTE_ADDR']; // fallback for guests

if ($method === 'POST') {
    // Handle like/unlike action
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['target_id'], $data['target_type'], $data['action'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        exit;
    }

    $target_id = intval($data['target_id']);
    $target_type = $data['target_type'];
    $action = $data['action'];

    // Use user_id if available, otherwise IP as unique identifier
    $identifier = $user_id ?: 0;
    $guest_id = $user_id ? null : $ip_address;

    if ($action === 'like') {
        $stmt = $conn->prepare("INSERT IGNORE INTO likes (user_id, guest_ip, target_id, target_type) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isis", $identifier, $guest_id, $target_id, $target_type);
        $stmt->execute();
        $stmt->close();
    } elseif ($action === 'unlike') {
        $stmt = $conn->prepare("DELETE FROM likes WHERE target_id = ? AND target_type = ? AND (user_id = ? OR guest_ip = ?)");
        $stmt->bind_param("isis", $target_id, $target_type, $identifier, $guest_id);
        $stmt->execute();
        $stmt->close();
    }

    echo json_encode(['success' => true]);
    exit;
}

// Default: GET request -> Fetch like counts
$totalLikes = [];
$userLiked = [];

// ✅ Always get total likes
$result = $conn->query("SELECT target_id, target_type, COUNT(*) AS total 
                        FROM likes 
                        GROUP BY target_id, target_type");
while ($row = $result->fetch_assoc()) {
    $key = $row['target_type'] . '_' . $row['target_id'];
    $totalLikes[$key] = (int)$row['total'];
}
$result->close();

// ✅ Track likes for logged-in users OR guests
if ($user_id) {
    $stmt = $conn->prepare("SELECT target_id, target_type FROM likes WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
} else {
    $stmt = $conn->prepare("SELECT target_id, target_type FROM likes WHERE guest_ip = ?");
    $stmt->bind_param("s", $ip_address);
}
$stmt->execute();
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
    $key = $row['target_type'] . '_' . $row['target_id'];
    $userLiked[$key] = true;
}
$stmt->close();

echo json_encode([
    'success' => true,
    'total_likes' => $totalLikes,
    'user_liked' => $userLiked
]);

$conn->close();
