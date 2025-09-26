<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php';

$posts = [];
$sql = "SELECT * FROM posts ORDER BY created_at DESC";
$result = $conn->query($sql);

while ($post = $result->fetch_assoc()) {
    $postId = $post['id'];
    $post['media'] = [];

    // ✅ Fetch user info for post
    $userQuery = $conn->prepare("SELECT first_name, last_name, profile_pic FROM users WHERE id = ?");
    $userQuery->bind_param("i", $post['user_id']);
    $userQuery->execute();
    $userResult = $userQuery->get_result();
    $user = $userResult->fetch_assoc();

    $post['first_name'] = $user['first_name'];
    $post['last_name']  = $user['last_name'];
    $post['profile_picture'] = !empty($user['profile_pic'])
        ? (strpos($user['profile_pic'], 'http') === 0 
            ? $user['profile_pic'] 
            : "http://localhost/coolpage/my-app/backend/uploads/" . $user['profile_pic'])
        : "http://localhost/coolpage/my-app/backend/default-avatar.png";

    $userQuery->close();

    // ✅ Fetch media for post
    $mediaQuery = $conn->prepare("SELECT media_url, media_type FROM post_media WHERE post_id = ?");
    $mediaQuery->bind_param("i", $postId);
    $mediaQuery->execute();
    $mediaResult = $mediaQuery->get_result();

    while ($media = $mediaResult->fetch_assoc()) {
        $post['media'][] = [
            'url'  => "http://localhost/coolpage/my-app/backend/" . $media['media_url'],
            'type' => $media['media_type']
        ];
    }
    $mediaQuery->close();

    // ✅ Fetch replies
    $replies = [];
    $replyQuery = $conn->prepare("SELECT * FROM replies WHERE post_id = ? ORDER BY created_at ASC");
    $replyQuery->bind_param("i", $postId);
    $replyQuery->execute();
    $replyResult = $replyQuery->get_result();

    while ($reply = $replyResult->fetch_assoc()) {
        $replyId = $reply['id'];
        $reply['media'] = [];

        // Reply media
        $replyMediaQuery = $conn->prepare("SELECT media_url, media_type FROM reply_media WHERE reply_id = ?");
        $replyMediaQuery->bind_param("i", $replyId);
        $replyMediaQuery->execute();
        $replyMediaResult = $replyMediaQuery->get_result();

        while ($media = $replyMediaResult->fetch_assoc()) {
            $reply['media'][] = [
                'url'  => "http://localhost/coolpage/my-app/backend/" . $media['media_url'],
                'type' => $media['media_type']
            ];
        }
        $replyMediaQuery->close();

        // ✅ Fetch user info for reply
        $userQuery = $conn->prepare("SELECT first_name, last_name, profile_pic FROM users WHERE username = ? LIMIT 1");
        $userQuery->bind_param("s", $reply['username']);
        $userQuery->execute();
        $userResult = $userQuery->get_result();
        $user = $userResult->fetch_assoc();

        $reply['first_name'] = $user['first_name'];
        $reply['last_name']  = $user['last_name'];
        $reply['profile_picture'] = !empty($user['profile_pic'])
            ? (strpos($user['profile_pic'], 'http') === 0 
                ? $user['profile_pic'] 
                : "http://localhost/coolpage/my-app/backend/uploads/" . $user['profile_pic'])
            : "http://localhost/coolpage/my-app/backend/default-avatar.png";

        $userQuery->close();

        $replies[] = $reply;
    }

    $replyQuery->close();
    $post['replies'] = $replies;

    $posts[] = $post;
}

echo json_encode([
    'success' => true,
    'posts'   => $posts
]);

$conn->close();
?>
