<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Cross-Origin-Opener-Policy: same-origin-allow-popups");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");


include "db.php"; // <-- your DB connection

$google_id = $_POST['google_id'] ?? '';
$email     = $_POST['email'] ?? '';
$name      = $_POST['name'] ?? '';
$avatar    = $_POST['avatar'] ?? '';

if (!$google_id || !$email) {
    echo json_encode(["success" => false, "message" => "Missing Google data"]);
    exit;
}

// Split full name into first and last (basic split)
$first_name = '';
$last_name  = '';
if (!empty($name)) {
    $parts = explode(' ', $name, 2);
    $first_name = $parts[0];
    $last_name  = $parts[1] ?? '';
}

// Check if user already exists by email
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    // User already exists → return user data
    echo json_encode(["success" => true, "user" => $user]);
} else {
    // Create new user
    $username   = strtolower(explode("@", $email)[0]); // username from email
    $profile_pic = $avatar;
    $typeofuser = "user";
    $created_at = date("Y-m-d H:i:s");
    $country    = ""; // optional, could be filled later
    $password   = ""; // Google users don’t need password

    $stmt = $conn->prepare(
        "INSERT INTO users (username, first_name, last_name, email, password, profile_pic, created_at, country, typeofuser) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("sssssssss", $username, $first_name, $last_name, $email, $password, $profile_pic, $created_at, $country, $typeofuser);

    if ($stmt->execute()) {
        $newUserId = $stmt->insert_id;
        $newUser = [
            "id"          => $newUserId,
            "username"    => $username,
            "first_name"  => $first_name,
            "last_name"   => $last_name,
            "email"       => $email,
            "profile_pic" => $profile_pic,
            "created_at"  => $created_at,
            "country"     => $country,
            "typeofuser"  => $typeofuser
        ];
        echo json_encode(["success" => true, "user" => $newUser]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to create user"]);
    }
}
