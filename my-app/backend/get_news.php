<?php
// get_news.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

require 'db.php'; // $conn

$baseUrl = 'http://localhost/coolpage/my-app/backend/';

// Optional pagination
$page  = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;
$offset = ($page - 1) * $limit;

// Optional filter by post ID
$postIdFilter = isset($_GET['id']) ? intval($_GET['id']) : null;

// Build SQL dynamically
if ($postIdFilter) {
    $sql = "
        SELECT 
            np.id,
            np.user_id,
            np.title,
            np.category,
            np.content,
            np.created_at,
            COALESCE(u.username, '') AS username
        FROM newspost np
        LEFT JOIN users u ON np.user_id = u.id
        WHERE np.id = ?
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to prepare query', 'error' => $conn->error]);
        exit;
    }

    $stmt->bind_param("i", $postIdFilter);
} else {
    $sql = "
        SELECT 
            np.id,
            np.user_id,
            np.title,
            np.category,
            np.content,
            np.created_at,
            COALESCE(u.username, '') AS username
        FROM newspost np
        LEFT JOIN users u ON np.user_id = u.id
        ORDER BY np.created_at DESC
        LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to prepare query', 'error' => $conn->error]);
        exit;
    }

    $stmt->bind_param("ii", $limit, $offset);
}

$stmt->execute();
$result = $stmt->get_result();

$news = [];

$mediaStmt = $conn->prepare("SELECT media_url, media_type FROM newspost_media WHERE post_id = ?");
if (!$mediaStmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to prepare media query', 'error' => $conn->error]);
    $stmt->close();
    exit;
}

while ($post = $result->fetch_assoc()) {
    $postId = (int)$post['id'];

    $mediaStmt->bind_param("i", $postId);
    $mediaStmt->execute();
    $mediaRes = $mediaStmt->get_result();

    $mediaArr = [];
    while ($m = $mediaRes->fetch_assoc()) {
        $url = $m['media_url'] ?? '';
        if ($url !== '' && preg_match('/^https?:\/\//i', $url)) {
            $fullUrl = $url;
        } else {
            $fullUrl = rtrim($baseUrl, '/') . '/' . ltrim($url, '/');
        }

        $mediaArr[] = [
            'url' => $fullUrl,
            'type' => $m['media_type'] ?? 'image'
        ];
    }

    $post['media'] = $mediaArr;
    $news[] = $post;
}

$mediaStmt->close();
$stmt->close();
$conn->close();

echo json_encode([
    'success' => true,
    'page' => $page,
    'limit' => $limit,
    'count' => count($news),
    'news' => $news
]);
