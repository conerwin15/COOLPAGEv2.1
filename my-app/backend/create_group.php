<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name'], $data['created_by'], $data['visibility'])) {
    echo json_encode([
        'success' => false,
        'message' => '⚠️ Missing required fields: name, created_by, or visibility'
    ]);
    exit;
}

$name = trim($data['name']);
$description = isset($data['description']) ? trim($data['description']) : null;
$type = $data['visibility'] === 'private' ? 'private' : 'public'; // fallback to public
$created_by = intval($data['created_by']);

if ($name === '') {
    echo json_encode([
        'success' => false,
        'message' => '⚠️ Group name cannot be empty.'
    ]);
    exit;
}

$sql = "INSERT INTO groups (name, description, visibility, created_by, created_at)
        VALUES (?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssi", $name, $description, $type, $created_by);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Group created successfully!',
        'group_id' => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
