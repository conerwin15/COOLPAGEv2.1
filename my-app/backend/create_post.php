<?php
// ✅ Allow frontend access and handle preflight
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ DB connection
$host = "localhost";
$user = "root";
$password = "";
$db = "cool";
$conn = new mysqli($host, $user, $password, $db);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// ✅ Get user info
$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$title = $_POST['title'] ?? ''; // ✅ Get title
$content = $_POST['content'] ?? '';
$category = $_POST['category'] ?? 'General';
$country = $_POST['country'] ?? ''; // ✅ Get country
date_default_timezone_set('Asia/Singapore');
$created_at = date('Y-m-d H:i:s'); // Example: 2025-08-13 23:45:12


// ✅ Media upload handling
$uploadDir = "uploads/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}
$mediaList = [];
if (!empty($_FILES['media']['name'][0])) {
    foreach ($_FILES['media']['name'] as $index => $fileName) {
        $filename = time() . "_" . basename($fileName);
        $targetFile = $uploadDir . $filename;
        $mediaType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
        $tmpName = $_FILES['media']['tmp_name'][$index];

        if (move_uploaded_file($tmpName, $targetFile)) {
            $mediaList[] = [
                'url' => $targetFile,
                'type' => $mediaType
            ];
        }
    }
}

// ✅ Get user_id and profile
$userStmt = null;
if (!empty($username)) {
    $userStmt = $conn->prepare("SELECT id, username, profile_pic FROM users WHERE username = ? LIMIT 1");
    $userStmt->bind_param("s", $username);
} elseif (!empty($email)) {
    $userStmt = $conn->prepare("SELECT id, username, profile_pic FROM users WHERE email = ? LIMIT 1");
    $userStmt->bind_param("s", $email);
}

$profile_picture = "http://localhost/coolpage/my-app/backend/default-avatar.png";
$user_id = null;
if ($userStmt) {
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    if ($user = $userResult->fetch_assoc()) {
        $username = $user['username'];
        $user_id = $user['id'];
        if (!empty($user['profile_pic'])) {
            $profile_picture = "http://localhost/coolpage/my-app/backend/" . $user['profile_pic'];
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    $userStmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Username or email is required']);
    exit;
}

// ✅ Insert post with title and country
$stmt = $conn->prepare("INSERT INTO posts (user_id, title, content, category, country, created_at, username) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("issssss", $user_id, $title, $content, $category, $country, $created_at, $username);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $postId = $stmt->insert_id;

    foreach ($mediaList as $media) {
        $mediaStmt = $conn->prepare("INSERT INTO post_media (post_id, media_url, media_type) VALUES (?, ?, ?)");
        $mediaStmt->bind_param("iss", $postId, $media['url'], $media['type']);
        $mediaStmt->execute();
        $mediaStmt->close();
    }

    $post = [
        'id' => $postId,
        'user_id' => $user_id,
        'username' => $username,
        'title' => $title,
        'text' => $content,
        'category' => $category,
        'country' => $country,
        'created_at' => $created_at,
        'profile_picture' => $profile_picture,
        'media' => array_map(fn($m) => [
            'url' => "http://localhost/coolpage/my-app/backend/" . $m['url'],
            'type' => $m['type']
        ], $mediaList),
        'replies' => []
    ];

    echo json_encode(['success' => true, 'message' => 'Post created', 'post' => $post]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create post']);
}

$stmt->close();
$conn->close();
?>