<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php'; // make sure this connects to your MySQL

$action = $_POST['action'] ?? '';
$user_id = intval($_POST['id'] ?? 0);

$response = ["success" => false, "message" => "Invalid request"];

if ($action === 'update_info' && $user_id > 0) {
    // ✅ Update user info
    $username   = $_POST['username'] ?? '';
    $first_name = $_POST['first_name'] ?? '';
    $last_name  = $_POST['last_name'] ?? '';
    $email      = $_POST['email'] ?? '';
    $country    = $_POST['country'] ?? '';
    $typeofuser = $_POST['typeofuser'] ?? '';
    $profile_pic = $_POST['profile_pic'] ?? ''; // store file name or URL

    $stmt = $conn->prepare("UPDATE users SET username=?, first_name=?, last_name=?, email=?, country=?, typeofuser=?, profile_pic=? WHERE id=?");
    $stmt->bind_param("sssssssi", $username, $first_name, $last_name, $email, $country, $typeofuser, $profile_pic, $user_id);

    if ($stmt->execute()) {
        $response = ["success" => true, "message" => "User info updated successfully"];
    } else {
        $response = ["success" => false, "message" => "Failed to update user info"];
    }
    $stmt->close();

} elseif ($action === 'update_password' && $user_id > 0) {
    // ✅ Update user password
    $new_password = $_POST['password'] ?? '';

    if (strlen($new_password) < 6) {
        $response = ["success" => false, "message" => "Password must be at least 6 characters"];
    } else {
        $hashed = password_hash($new_password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("UPDATE users SET password=? WHERE id=?");
        $stmt->bind_param("si", $hashed, $user_id);

        if ($stmt->execute()) {
            $response = ["success" => true, "message" => "Password updated successfully"];
        } else {
            $response = ["success" => false, "message" => "Failed to update password"];
        }
        $stmt->close();
    }

} elseif ($action === 'delete' && $user_id > 0) {
    // ✅ Delete user
    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param("i", $user_id);

    if ($stmt->execute()) {
        $response = ["success" => true, "message" => "User deleted successfully"];
    } else {
        $response = ["success" => false, "message" => "Failed to delete user"];
    }
    $stmt->close();
}

echo json_encode($response);
$conn->close();
?>
