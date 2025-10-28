<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php';



// Capture input
$postId = $_POST['post_id'] ?? '';
$userId = $_POST['user_id'] ?? '';
$text = $_POST['text'] ?? '';
$createdAt = date('Y-m-d H:i:s');

if (empty($postId) || empty($userId)) {
    echo json_encode(['success' => false, 'message' => 'Missing post ID or user ID']);
    exit;
}

// Validate post
$checkPost = $conn->prepare("SELECT id FROM posts WHERE id = ?");
$checkPost->bind_param("i", $postId);
$checkPost->execute();
$result = $checkPost->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
    exit;
}
$checkPost->close();

// Get user info
$name = 'Unknown';
$profilePic = 'default-avatar.png';
$getUser = $conn->prepare("SELECT username, profile_pic FROM users WHERE id = ?");
$getUser->bind_param("i", $userId);
$getUser->execute();
$userResult = $getUser->get_result();
if ($row = $userResult->fetch_assoc()) {
    $name = $row['username'];
    $profilePic = $row['profile_pic'] ?? 'default-avatar.png';
}
$getUser->close();

// Insert reply
$stmt = $conn->prepare("INSERT INTO replies (post_id, user_id, username, text, created_at) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iisss", $postId, $userId, $name, $text, $createdAt);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $replyId = $stmt->insert_id;
    $mediaList = [];

    $uploadDir = "uploads/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (!empty($_FILES['media']['name'][0])) {
        foreach ($_FILES['media']['name'] as $index => $fileName) {
            $tmpName = $_FILES['media']['tmp_name'][$index];
            $uniqueName = uniqid() . "_" . basename($fileName);
            $targetFile = $uploadDir . $uniqueName;

            $allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'image/webp', 'video/webm', 'video/ogg'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $fileType = finfo_file($finfo, $tmpName);
            finfo_close($finfo);

            if (in_array($fileType, $allowedTypes)) {
                if (move_uploaded_file($tmpName, $targetFile)) {
                    $mediaType = pathinfo($targetFile, PATHINFO_EXTENSION);
                    $stmtMedia = $conn->prepare("INSERT INTO reply_media (reply_id, media_url, media_type) VALUES (?, ?, ?)");
                    $stmtMedia->bind_param("iss", $replyId, $targetFile, $mediaType);
                    $stmtMedia->execute();
                    $stmtMedia->close();

                    $mediaList[] = [
                        'url' => "http://localhost/coolpage/my-app/backend/" . $targetFile,
                        'type' => $mediaType
                    ];
                }
            }
        }
    }

    $reply = [
        'username' => $name,
        'text' => $text,
        'created_at' => $createdAt,
        'media' => $mediaList,
        'profile_picture' => "http://localhost/coolpage/my-app/backend/" . $profilePic
    ];

    echo json_encode(['success' => true, 'reply' => $reply]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to insert reply']);
}

$stmt->close();
$conn->close();
?>
