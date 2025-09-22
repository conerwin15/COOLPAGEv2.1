<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php';

function columnExists($conn, $table, $column) {
    $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    return $result && $result->num_rows > 0;
}

$posts = [];

// ✅ If a specific post ID is requested
if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
    $postIdFilter = intval($_GET['post_id']);
    $sql = "SELECT * FROM posts WHERE id = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $postIdFilter);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();
} else {
    $sql = "SELECT * FROM posts ORDER BY created_at DESC";
    $result = $conn->query($sql);
}

while ($post = $result->fetch_assoc()) {
    $postId = $post['id'];
    $post['media'] = [];

    // ✅ Fetch user profile picture for the post's author
    $userQuery = $conn->prepare("SELECT profile_pic FROM users WHERE id = ?");
    $userQuery->bind_param("i", $post['user_id']);
    $userQuery->execute();
    $userResult = $userQuery->get_result();
    $user = $userResult->fetch_assoc();
    $userQuery->close();

    // ✅ Handle both Google avatars (full URL) and local uploads
    if (!empty($user['profile_pic'])) {
        if (filter_var($user['profile_pic'], FILTER_VALIDATE_URL)) {
            // Google avatar URL
            $post['profile_picture'] = $user['profile_pic'];
        } else {
            // Local uploaded avatar
            $post['profile_picture'] = "http://localhost/coolpage/my-app/backend/uploads/" . $user['profile_pic'];
        }
    } else {
        $post['profile_picture'] = "http://localhost/coolpage/my-app/backend/default-avatar.png";
    }

    // ✅ Fetch media for the post
    if (columnExists($conn, "post_media", "post_id")) {
        $mediaQuery = $conn->prepare("SELECT media_url, media_type FROM post_media WHERE post_id = ?");
        $mediaQuery->bind_param("i", $postId);
        $mediaQuery->execute();
        $mediaResult = $mediaQuery->get_result();
        while ($media = $mediaResult->fetch_assoc()) {
            $post['media'][] = [
                'url' => "http://localhost/coolpage/my-app/backend/" . $media['media_url'],
                'type' => $media['media_type']
            ];
        }
        $mediaQuery->close();
    }

    // ✅ Fetch replies for the post
    $replies = [];
    if (columnExists($conn, "replies", "post_id")) {
        $replyQuery = $conn->prepare("SELECT * FROM replies WHERE post_id = ? ORDER BY created_at ASC");
        $replyQuery->bind_param("i", $postId);
        $replyQuery->execute();
        $replyResult = $replyQuery->get_result();

        while ($reply = $replyResult->fetch_assoc()) {
            $replyId = $reply['id'];
            $reply['media'] = [];

            // Reply media
            if (columnExists($conn, "reply_media", "reply_id")) {
                $replyMediaQuery = $conn->prepare("SELECT media_url, media_type FROM reply_media WHERE reply_id = ?");
                $replyMediaQuery->bind_param("i", $replyId);
                $replyMediaQuery->execute();
                $replyMediaResult = $replyMediaQuery->get_result();
                while ($media = $replyMediaResult->fetch_assoc()) {
                    $reply['media'][] = [
                        'url' => "http://localhost/coolpage/my-app/backend/" . $media['media_url'],
                        'type' => $media['media_type']
                    ];
                }
                $replyMediaQuery->close();
            }

            // Reply profile picture
            $userQuery = $conn->prepare("SELECT profile_pic FROM users WHERE username = ? LIMIT 1");
            $userQuery->bind_param("s", $reply['username']);
            $userQuery->execute();
            $userResult = $userQuery->get_result()->fetch_assoc();
            $userQuery->close();

            if (!empty($userResult['profile_pic'])) {
                if (filter_var($userResult['profile_pic'], FILTER_VALIDATE_URL)) {
                    $reply['profile_picture'] = $userResult['profile_pic'];
                } else {
                    $reply['profile_picture'] = "http://localhost/coolpage/my-app/backend/uploads/" . $userResult['profile_pic'];
                }
            } else {
                $reply['profile_picture'] = "http://localhost/coolpage/my-app/backend/default-avatar.png";
            }

            $replies[] = $reply;
        }
        $replyQuery->close();
    }

    $post['replies'] = $replies;

    // Likes count
    $post['total_likes'] = 0;
    if (columnExists($conn, "likes", "post_id")) {
        $likesQuery = $conn->prepare("SELECT COUNT(*) as total_likes FROM likes WHERE post_id = ?");
        $likesQuery->bind_param("i", $postId);
        $likesQuery->execute();
        $likesResult = $likesQuery->get_result()->fetch_assoc();
        $post['total_likes'] = $likesResult['total_likes'] ?? 0;
        $likesQuery->close();
    }

    $posts[] = $post;
}

echo json_encode([
    'success' => true,
    'posts' => $posts
]);

$conn->close();
?>
