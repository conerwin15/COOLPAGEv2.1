<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "cool";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}
?>

