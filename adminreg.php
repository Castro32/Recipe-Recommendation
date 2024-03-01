<?php
// Connect to the database
$host = "localhost";
$username = "root";
$password = "";
$dbname = "joyce";
$conn = mysqli_connect($host, $username, $password, $dbname);

// Check connection 
if (!$conn) {
              die("Connection failed: " . mysqli_connect_error());
          }

          // Sanitize form inputs
          $First_Name = mysqli_real_escape_string($conn, $_POST['First_Name']);
          $Last_Name = mysqli_real_escape_string($conn, $_POST['Last_Name']);
          $email = mysqli_real_escape_string($conn, $_POST['email']);
          $phone = mysqli_real_escape_string($conn, $_POST['phone']);
          $password = mysqli_real_escape_string($conn, $_POST['password']);
          $confirm = mysqli_real_escape_string($conn, $_POST['confirm-password']);

          // Check if email already exists
          $sql = "SELECT * FROM users WHERE email='$email'";
          $result = mysqli_query($conn, $sql);

          if (mysqli_num_rows($result) > 0) {
            echo "<script>alert('Sorry, this email has already been used.');window.location.href='register.html';</script>";
            exit();
          }

          // Insert user data into the table
          $sql = "INSERT INTO users (First_Name, Last_Name, email, phone, password) 
          VALUES ('$First_Name','$Last_Name', '$email','$phone', '$password')";
          if (mysqli_query($conn, $sql)) {
            echo "<script>alert('Signup was successful');window.location.href='login.html';</script>";
          } else {
              echo "Error: " . $sql . "<br>" . mysqli_error($conn);
          }

// Close the database connection
mysqli_close($conn);
?>
