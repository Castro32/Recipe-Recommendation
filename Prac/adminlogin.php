<?php

// Start a session
session_start();

// Connect to the database
$host = "localhost";
$username = "root";
$password = "";
$dbname = "joyce";

$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form has been submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Get the form data
    $email = $_POST["email"];
    $password = $_POST["password"];

    // Prepare and execute the query to fetch the user based on email
    $stmt = $conn->prepare("SELECT * FROM users WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if a user with the provided email exists
    if ($result->num_rows === 1) {
        // Fetch the user details
        $row = $result->fetch_assoc();
        
        // Verify the password
        if ($password === $row["password"]) {
            // Password is correct, log in the user
            $_SESSION["email"] = $row["email"];
            // Regenerate session ID to prevent session fixation attacks
            session_regenerate_id(true);
            header("Location: dashboard.html");
            exit();
        } else {
            // Password is incorrect
            echo "<script type='text/javascript'> alert('Invalid email or password. Please try again.'); window.location.href = 'login.html';</script>";
            exit();
        }
    } else {
        // User with the provided email does not exist in the database
        echo "<script> alert('User with the email does not exist in the database.'); window.location.href = 'login.html';</script>";
        exit();
    }

}

?>
