<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

function respond($arr) {
    echo json_encode($arr);
    exit;
}

// ✅ Read fields from FormData ($_POST)
$name        = isset($_POST['name']) ? trim($_POST['name']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : null;
$visibility  = (isset($_POST['visibility']) && $_POST['visibility'] === 'private') ? 'private' : 'public';
$created_by  = isset($_POST['created_by']) ? intval($_POST['created_by']) : 0;

// ✅ Validation
if ($name === '' || $created_by <= 0 || $visibility === '') {
    respond([
        'success' => false,
        'message' => '⚠️ Missing required fields: name, created_by, or visibility'
    ]);
}

// ✅ Handle file upload if provided
$group_photos = null;
if (isset($_FILES['group_photos']) && $_FILES['group_photos']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . "/uploads/groups/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $filename = time() . "_" . basename($_FILES['group_photos']['name']);
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($_FILES['group_photos']['tmp_name'], $targetPath)) {
        // save relative path or URL in DB
        $group_photos = "uploads/groups/" . $filename;
    } else {
        respond([
            'success' => false,
            'message' => '❌ Failed to upload group photo.'
        ]);
    }
}

// ✅ Insert into database
$sql = "INSERT INTO groups (name, description, visibility, created_by, group_photos, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssis", $name, $description, $visibility, $created_by, $group_photos);

if ($stmt->execute()) {
    respond([
        'success' => true,
        'message' => '✅ Group created successfully!',
        'group_id' => $stmt->insert_id,
        'group_photo' => $group_photos
    ]);
} else {
    respond([
        'success' => false,
        'message' => '❌ Database error: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
