<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// Get input
$input = json_decode(file_get_contents('php://input'), true);
$user_id = $input['user_id'] ?? null;

error_log("📥 Raw input: " . file_get_contents('php://input'));
error_log("🧾 Parsed user_id: " . json_encode($user_id));

if (!$user_id || !is_numeric($user_id)) {
    error_log("❌ Missing or invalid user_id");
    echo json_encode(['success' => false, 'error' => 'Missing or invalid user_id']);
    exit;
}

$now = date('Y-m-d H:i:s');

$stmt = $conn->prepare("
    INSERT INTO user_activity (user_id, last_active)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE last_active = VALUES(last_active)
");

if (!$stmt) {
    error_log("❌ Prepare failed: " . $conn->error);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param("is", $user_id, $now);

if ($stmt->execute()) {
    error_log("✅ Inserted or updated activity for user_id $user_id at $now");
    echo json_encode(['success' => true]);
} else {
    error_log("❌ Execute failed: " . $stmt->error);
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
?>
