<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    exit(0);
}

// Set response headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Include DB connection
require 'db.php';

// Validate user ID
$user_id = $_GET['user_id'] ?? null;

if (!$user_id || !is_numeric($user_id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
    exit;
}

// Query user data
$stmt = $conn->prepare("
    SELECT 
        id, 
        username,
        first_name AS firstname,
        last_name AS lastname,
        email,
        country,
        profile_pic,
        typeofuser,
        created_at 
    FROM users 
    WHERE id = ?
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $user = $result->fetch_assoc()) {
    // Base URL for uploads
    $base_url = "https://cool.reallylesson.com/backend/uploads/";

    // Generate full profile picture URL
    if (!empty($user['profile_pic'])) {
        if (strpos($user['profile_pic'], 'http') === 0) {
            // Already a full URL (Google, external, etc.)
            $user['profile_picture'] = $user['profile_pic'];
        } else {
            // Local file, prepend base URL
            $user['profile_picture'] = $base_url . $user['profile_pic'];
        }
    } else {
        // Default avatar
        $user['profile_picture'] = "https://cool.reallylesson.com/backend/default-avatar.png";
    }

    echo json_encode(['success' => true, 'user' => $user]);
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

$stmt->close();
$conn->close();
?>
