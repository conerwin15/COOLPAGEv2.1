<?php 
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require 'db.php';

$group_id = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if (!$group_id) {
    echo json_encode(['success' => false, 'message' => 'Missing group_id']);
    exit;
}

$posts = [];
$sql = "SELECT * FROM group_posts WHERE group_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $group_id);
$stmt->execute();
$result = $stmt->get_result();

while ($post = $result->fetch_assoc()) {
    $postId = $post['id'];
    $post['media'] = [];

    // Author profile picture
    $userQuery = $conn->prepare("SELECT profile_pic FROM users WHERE id = ?");
    $userQuery->bind_param("i", $post['user_id']);
    $userQuery->execute();
    $userResult = $userQuery->get_result()->fetch_assoc();
    $userQuery->close();

    $post['profile_picture'] = !empty($userResult['profile_pic'])
        ? (strpos($userResult['profile_pic'], 'http') === 0 
            ? $userResult['profile_pic'] 
            : "http://localhost/coolpage/my-app/backend/uploads/" . $userResult['profile_pic'])
        : "http://localhost/coolpage/my-app/backend/uploads/default-avatar.png";

    // Post media
    $mediaQuery = $conn->prepare("SELECT media_url, media_type FROM group_post_media WHERE post_id = ?");
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

    // Replies
    $replies = [];
    $replyQuery = $conn->prepare("SELECT * FROM group_post_replies WHERE post_id = ? ORDER BY created_at ASC");
    $replyQuery->bind_param("i", $postId);
    $replyQuery->execute();
    $replyResult = $replyQuery->get_result();

    while ($reply = $replyResult->fetch_assoc()) {
        $replyId = $reply['id'];
        $reply['media'] = [];

        // Reply media
        $replyMediaQuery = $conn->prepare("SELECT media_url, media_type FROM group_reply_media WHERE reply_id = ?");
        $replyMediaQuery->bind_param("i", $replyId);
        $replyMediaQuery->execute();
        $mediaResult = $replyMediaQuery->get_result();
        while ($media = $mediaResult->fetch_assoc()) {
            $reply['media'][] = [
                'url' => "http://localhost/coolpage/my-app/backend/" . $media['media_url'],
                'type' => $media['media_type']
            ];
        }
        $replyMediaQuery->close();

        // Reply profile picture
        $userQuery = $conn->prepare("SELECT profile_pic FROM users WHERE username = ? LIMIT 1");
        $userQuery->bind_param("s", $reply['username']);
        $userQuery->execute();
        $userResult = $userQuery->get_result()->fetch_assoc();
        $userQuery->close();

        $reply['profile_picture'] = !empty($userResult['profile_pic'])
            ? (strpos($userResult['profile_pic'], 'http') === 0 
                ? $userResult['profile_pic'] 
                : "http://localhost/coolpage/my-app/backend/uploads/" . $userResult['profile_pic'])
            : "http://localhost/coolpage/my-app/backend/uploads/default-avatar.png";

        // Like count (reply)
        $likeCountQuery = $conn->prepare("SELECT COUNT(*) as like_count FROM group_reply_likes WHERE reply_id = ?");
        $likeCountQuery->bind_param("i", $replyId);
        $likeCountQuery->execute();
        $reply['like_count'] = (int) $likeCountQuery->get_result()->fetch_assoc()['like_count'];
        $likeCountQuery->close();

        // Liked by user? (reply)
        $likedQuery = $conn->prepare("SELECT 1 FROM group_reply_likes WHERE user_id = ? AND reply_id = ? LIMIT 1");
        $likedQuery->bind_param("ii", $user_id, $replyId);
        $likedQuery->execute();
        $reply['user_liked'] = $likedQuery->get_result()->num_rows > 0;
        $likedQuery->close();

        $replies[] = $reply;
    }
    $replyQuery->close();
    $post['replies'] = $replies;

    // Like count (post)
    $likeCountQuery = $conn->prepare("SELECT COUNT(*) as like_count FROM group_post_likes WHERE target_id = ? AND target_type = 'post'");
    $likeCountQuery->bind_param("i", $postId);
    $likeCountQuery->execute();
    $post['like_count'] = (int) $likeCountQuery->get_result()->fetch_assoc()['like_count'];
    $likeCountQuery->close();

    // Liked by user? (post)
    $likedQuery = $conn->prepare("SELECT 1 FROM group_post_likes WHERE user_id = ? AND target_id = ? AND target_type = 'post' LIMIT 1");
    $likedQuery->bind_param("ii", $user_id, $postId);
    $likedQuery->execute();
    $post['user_liked'] = $likedQuery->get_result()->num_rows > 0;
    $likedQuery->close();

    $posts[] = $post;
}
$stmt->close();

// Group members
$members = [];
$memberQuery = $conn->prepare("SELECT gm.user_id, gm.invited_by, u.username FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ?");
$memberQuery->bind_param("i", $group_id);
$memberQuery->execute();
$memberResult = $memberQuery->get_result();
while ($row = $memberResult->fetch_assoc()) {
    $members[] = $row;
}
$memberQuery->close();

$conn->close();

echo json_encode([
    'success' => true,
    'group_id' => $group_id,
    'posts' => $posts,
    'members' => $members
]);
