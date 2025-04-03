<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";  // Change if necessary
$password = "";      // Change if necessary
$dbname = "food_sharing";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed"]));
}

// Get the request data
$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

// Register a User
if ($action == "register") {
    $name = $data['name'];
    $mobile = $data['mobile'];
    $username = $data['username'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (name, mobile, username, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $mobile, $username, $password);

    echo json_encode(["success" => $stmt->execute()]);
    $stmt->close();
}

// Login
if ($action == "login") {
    $username = $data['username'];
    $password = $data['password'];

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    if ($result && password_verify($password, $result['password'])) {
        echo json_encode(["success" => true, "user_id" => $result['id']]);
    } else {
        echo json_encode(["success" => false]);
    }

    $stmt->close();
}

// Add Food Item
if ($action == "addFood") {
    $name = $data['name'];
    $quantity = $data['quantity'];
    $address = $data['address'];
    $category = $data['category'];
    $donor_id = $data['donor_id'];

    $imagePath = "uploads/" . basename($_FILES["image"]["name"]);
    move_uploaded_file($_FILES["image"]["tmp_name"], $imagePath);

    $stmt = $conn->prepare("INSERT INTO food_items (name, image, quantity, address, category, donor_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssi", $name, $imagePath, $quantity, $address, $category, $donor_id);

    echo json_encode(["success" => $stmt->execute()]);
    $stmt->close();
}

// Fetch Available Food Items
if ($action == "getFood") {
    $result = $conn->query("SELECT * FROM food_items");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

// Request Food
if ($action == "requestFood") {
    $food_id = $data['food_id'];
    $receiver_id = $data['receiver_id'];

    $stmt = $conn->prepare("INSERT INTO food_requests (food_id, receiver_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $food_id, $receiver_id);

    echo json_encode(["success" => $stmt->execute()]);
    $stmt->close();
}

// Fetch User Orders
if ($action == "getOrders") {
    $receiver_id = $_GET['receiver_id'];

    $stmt = $conn->prepare("SELECT f.name, f.quantity, f.address, r.status 
                            FROM food_requests r 
                            JOIN food_items f ON r.food_id = f.id 
                            WHERE r.receiver_id = ?");
    $stmt->bind_param("i", $receiver_id);
    $stmt->execute();
    $result = $stmt->get_result();

    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    $stmt->close();
}

$conn->close();
?>
