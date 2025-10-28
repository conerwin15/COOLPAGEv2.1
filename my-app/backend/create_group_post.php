<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php'; // DB connection

// Use $_POST when receiving FormData
$requiredFields = ['group_id', 'user_id', 'title', 'content', 'username', 'category', 'country'];
foreach ($requiredFields as $field) {
    if (!isset($_POST[$field])) {
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit;
    }
}

$group_id  = intval($_POST['group_id']);
$user_id   = intval($_POST['user_id']);
$title     = trim($_POST['title']);
$content   = trim($_POST['content']);
$username  = trim($_POST['username']);
$category  = trim($_POST['category']);
$country   = trim($_POST['country']);
date_default_timezone_set('Asia/Manila');
$created_at = date('Y-m-d H:i:s'); // e.g. 2025-08-13 23:45:12

// Insert the post
$sqlPost = "INSERT INTO group_posts 
    (user_id, group_id, title, content, created_at, username, category, country) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmtPost = $conn->prepare($sqlPost);
if (!$stmtPost) {
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}
$stmtPost->bind_param("iissssss", $user_id, $group_id, $title, $content, $created_at, $username, $category, $country);

if (!$stmtPost->execute()) {
    echo json_encode(['success' => false, 'message' => 'Error creating post.', 'error' => $stmtPost->error]);
    exit;
}
$post_id = $stmtPost->insert_id;
$stmtPost->close();

// Handle media files (if any)
$mediaResults = [];
$uploadDir = "uploads/";

if (!empty($_FILES['media']['name'][0])) {
    foreach ($_FILES['media']['name'] as $index => $filename) {
        $tmpName = $_FILES['media']['tmp_name'][$index];
        $type = $_FILES['media']['type'][$index];

        // Unique file name
        $targetFile = $uploadDir . time() . "_" . basename($filename);
        if (move_uploaded_file($tmpName, $targetFile)) {
            // Insert media reference into DB
            $sqlMedia = "INSERT INTO group_post_media (post_id, group_id, media_url, media_type, uploaded_at) 
                         VALUES (?, ?, ?, ?, ?)";
            $stmtMedia = $conn->prepare($sqlMedia);
            if ($stmtMedia) {
                $uploaded_at = date('Y-m-d H:i:s');
                $stmtMedia->bind_param("iisss", $post_id, $group_id, $targetFile, $type, $uploaded_at);
                if ($stmtMedia->execute()) {
                    $mediaResults[] = ['media_url' => $targetFile, 'status' => 'uploaded'];
                } else {
                    $mediaResults[] = ['media_url' => $targetFile, 'status' => 'failed', 'error' => $stmtMedia->error];
                }
                $stmtMedia->close();
            }
        } else {
            $mediaResults[] = ['media_url' => $filename, 'status' => 'upload_failed'];
        }
    }
}

echo json_encode([
    'success' => true,
    'message' => 'Group post created successfully.',
    'post_id' => $post_id,
    'media_results' => $mediaResults
]);
?>