<?php
// Handle CORS preflight (for OPTIONS requests)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    exit(0);
}

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

// Connect to DB
require 'db.php';

// Get user ID from request (optional)
$user_id = $_GET['user_id'] ?? null;

// Initialize result arrays
$totalLikes = [];
$userLiked = [];

// Get total likes grouped by target (post or reply)
$result = $conn->query("SELECT target_id, target_type, COUNT(*) as total FROM likes GROUP BY target_id, target_type");
while ($row = $result->fetch_assoc()) {
    $key = $row['target_type'] . '_' . $row['target_id'];
    $totalLikes[$key] = (int)$row['total'];
}
$result->close();

// Get items the user has liked
if ($user_id) {
    $stmt = $conn->prepare("SELECT target_id, target_type FROM likes WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $key = $row['target_type'] . '_' . $row['target_id'];
        $userLiked[$key] = true;
    }
    $stmt->close();
}

// Output like data
echo json_encode([
    'success' => true,
    'total_likes' => $totalLikes,
    'user_liked' => $userLiked
]);
?>
