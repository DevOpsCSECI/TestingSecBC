const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql'); // Assuming a MySQL connection is used for demonstration
const app = express();

// Hardcoded secret key (Information Leakage, Hardcoded Credential)
const SECRET_KEY = "HARDCODED_SUPER_SECRET_KEY";

// Create a MySQL connection (for the sake of example)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rootpassword',
  database: 'testdb'
});

// Example of a route vulnerable to SQL Injection
// Attacker controlled input from req.query.name is directly concatenated into SQL string
app.get('/getUser', (req, res) => {
  const userName = req.query.name; 
  const query = "SELECT * FROM users WHERE username = '" + userName + "'"; // SQL Injection
  connection.query(query, (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.json(results);
  });
});

// Example of a route vulnerable to Cross-Site Scripting (XSS)
// The user-controlled input is directly included in the response HTML without sanitization
app.get('/greet', (req, res) => {
  const greeting = req.query.greeting;
  res.send("<h1>Hello " + greeting + "</h1>"); // Potential XSS
});

// Example of unsafe eval usage
// If a user passes JavaScript code in req.query.code, it will be executed on the server
app.get('/runCode', (req, res) => {
  const code = req.query.code;
  eval(code); // Remote Code Execution (RCE) vulnerability
  res.send("Code executed");
});

// Example of weak cryptographic function usage
// MD5 is considered cryptographically weak for password hashing
app.get('/hashPassword', (req, res) => {
  const password = req.query.password;
  const hash = crypto.createHash('md5').update(password).digest('hex'); // Weak crypto
  res.send("MD5 Hash of password: " + hash);
});

// Example of insufficient input validation in a file read scenario (Directory Traversal)
// If code references reading from a filesystem, any path traversal can be dangerous
const fs = require('fs');
app.get('/readFile', (req, res) => {
  const fileName = req.query.file; 
  // Potential directory traversal if user supplies something like ../../etc/passwd
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) return res.status(500).send("File not found or other error");
    res.send(data);
  });
});

// Start the server for demonstration purposes
app.listen(3000, () => {
  console.log("Vulnerable app listening on port 3000");
});
