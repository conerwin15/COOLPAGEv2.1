<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'db.php';

// Check if POST request contains user_id and file
if (!isset($_POST['user_id']) || !isset($_FILES['profile_pic'])) {
    echo json_encode(['success' => false, 'message' => 'Missing user ID or file']);
    exit;
}

$userId = intval($_POST['user_id']);
$file = $_FILES['profile_pic'];

// Allowed file types
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$fileType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($fileType, $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    exit;
}

// Upload directory
$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$uniqueName = uniqid() . "_" . basename($file['name']);
$targetFile = $uploadDir . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
    echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
    exit;
}

// Update user profile picture in database
$stmt = $conn->prepare("UPDATE users SET profile_pic = ? WHERE id = ?");
$stmt->bind_param("si", $uniqueName, $userId);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Profile picture updated successfully',
        'profile_pic' => $uniqueName
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database update failed']);
}

$stmt->close();
$conn->close();
?>
