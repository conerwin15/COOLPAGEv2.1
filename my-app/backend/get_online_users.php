<?php
// CORS and JSON headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include 'db.php';

// Calculate cutoff for "online" users (last 60 seconds)
$cutoff = date('Y-m-d H:i:s', strtotime('-60 seconds'));

$sql = "
  SELECT u.id, u.username, u.profile_pic
  FROM users u
  INNER JOIN user_activity a ON u.id = a.user_id
  WHERE a.last_active >= ?
";

if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param("s", $cutoff);
    $stmt->execute();
    $result = $stmt->get_result();

    $online_users = [];

    while ($row = $result->fetch_assoc()) {
        $online_users[] = [
            'id' => (int)$row['id'],
            'username' => $row['username'],
            'profile_pic' => $row['profile_pic'] ?? null // can be URL or relative path
        ];
    }

    echo json_encode([
        'success' => true,
        'users' => $online_users
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Query preparation failed.',
        'error' => $conn->error
    ]);
}
?>
