<?php
// get_likes.php
// Returns JSON:
// {
//   success: true,
//   total_likes: { "6": 12, "7": 3, ... },   // always present
//   user_liked:  { "6": true, "9": true }    // present for logged-in user OR IP guest
// }

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

// Debug mode (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db.php';

// Optional user_id
$user_id = (isset($_GET['user_id']) && $_GET['user_id'] !== '') ? intval($_GET['user_id']) : null;

// Guest IP fallback
$ip_address = $_SERVER['REMOTE_ADDR'];

$total_likes = [];
$user_liked  = [];

// 1) Always get total likes grouped by target_type & target_id
$q = "SELECT target_type, target_id, COUNT(*) AS total
      FROM likes
      GROUP BY target_type, target_id";
if ($res = $conn->query($q)) {
    while ($r = $res->fetch_assoc()) {
        if ($r['target_type'] === 'post') {
            $total_likes[(string)$r['target_id']] = (int)$r['total'];
        }
    }
    $res->free();
}

// 2) Get likes for this user OR this guest IP
if ($user_id !== null && $user_id > 0) {
    // Logged-in user
    $stmt = $conn->prepare("SELECT target_id, target_type FROM likes WHERE user_id = ? AND target_type = 'post'");
    $stmt->bind_param("i", $user_id);
} else {
    // Guest (IP address)
    $stmt = $conn->prepare("SELECT target_id, target_type FROM likes WHERE ip_address = ? AND target_type = 'post'");
    $stmt->bind_param("s", $ip_address);
}

$stmt->execute();
$r = $stmt->get_result();
while ($row = $r->fetch_assoc()) {
    $user_liked[(string)$row['target_id']] = true;
}
$stmt->close();

// Output
echo json_encode([
    'success' => true,
    'total_likes' => $total_likes,
    'user_liked'  => $user_liked
], JSON_UNESCAPED_SLASHES);

$conn->close();
