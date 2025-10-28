<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

error_reporting(E_ERROR | E_PARSE); // prevent warnings from breaking JSON
include 'db.php';

// Read JSON input
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON received']);
    exit;
}

if (!isset($data['user_id'], $data['firstname'], $data['lastname'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$user_id   = intval($data['user_id']);
$firstName = trim($data['firstname']); // frontend sends "firstname"
$lastName  = trim($data['lastname']);  // frontend sends "lastname"

// Match DB fields: first_name, last_name
$sql = "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?";
if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param("ssi", $firstName, $lastName, $user_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Name updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update name']);
    }
    $stmt->close();
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Query preparation failed',
        'error'   => $conn->error
    ]);
}

$conn->close();
?>
