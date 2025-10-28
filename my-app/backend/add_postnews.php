<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'db.php';

// Capture input
$userId   = $_POST['user_id'] ?? '';
$title    = trim($_POST['title'] ?? '');      // title field
$category = trim($_POST['category'] ?? 'General'); // category field
$content  = trim($_POST['content'] ?? '');
date_default_timezone_set('Asia/Singapore');
$createdAt = date('Y-m-d H:i:s');

// Validate required fields
if (empty($userId) || empty($title) || empty($content)) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing user ID, title, or content'
    ]);
    exit;
}

// Insert into newspost table
$stmt = $conn->prepare(
    "INSERT INTO newspost (user_id, title, category, content, created_at) VALUES (?, ?, ?, ?, ?)"
);
$stmt->bind_param("issss", $userId, $title, $category, $content, $createdAt);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $postId = $stmt->insert_id;
    $mediaList = [];

    $uploadDir = "uploads/";
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0755, true);

    // Handle media uploads
    if (!empty($_FILES['media']['name'][0])) {
        foreach ($_FILES['media']['name'] as $index => $fileName) {
            $tmpName = $_FILES['media']['tmp_name'][$index];
            $uniqueName = uniqid() . "_" . basename($fileName);
            $targetFile = $uploadDir . $uniqueName;

            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $fileType = finfo_file($finfo, $tmpName);
            finfo_close($finfo);

            if (in_array($fileType, $allowedTypes)) {
                if (move_uploaded_file($tmpName, $targetFile)) {
                    $mediaType = strpos($fileType, 'video') === 0 ? 'video' : 'image';

                    // Save into newspost_media table
                    $stmtMedia = $conn->prepare(
                        "INSERT INTO newspost_media (post_id, media_url, media_type) VALUES (?, ?, ?)"
                    );
                    $stmtMedia->bind_param("iss", $postId, $targetFile, $mediaType);
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

    echo json_encode([
        'success' => true,
        'message' => 'Post created successfully',
        'post' => [
            'id'       => $postId,
            'user_id'  => $userId,
            'title'    => $title,
            'category' => $category,
            'content'  => $content,
            'created_at' => $createdAt,
            'media'    => $mediaList
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create post']);
}

$stmt->close();
$conn->close();
?>
