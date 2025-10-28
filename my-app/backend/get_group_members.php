<?php
require 'db.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Validate and sanitize group_id
$group_id = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;

if ($group_id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid or missing group_id'
    ]);
    exit;
}

// Prepare and execute SQL statement
$sql = "
    SELECT u.id, u.username
    FROM group_members gm
    INNER JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ? AND gm.status = 'accepted'
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'SQL prepare error: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $group_id);

if (!$stmt->execute()) {
    echo json_encode([
        'success' => false,
        'message' => 'SQL execute error: ' . $stmt->error
    ]);
    exit;
}

$result = $stmt->get_result();

$members = [];
while ($row = $result->fetch_assoc()) {
    $members[] = $row;
}

echo json_encode([
    'success' => true,
    'members' => $members
]);

$stmt->close();
$conn->close();
?>
