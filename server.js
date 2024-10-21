const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware to parse request body and handle CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MySQL database connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mysql', // Keep sensitive info in .env
    database: process.env.DB_DATABASE || 'donation_system'
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Serve static files from the public directory (for serving HTML files)
app.use(express.static('public'));

// Route to handle donor signup
app.post('/donor_signup', async (req, res) => {
    const { name, email, password, location, mobile_number } = req.body;

    // Input validation
    if (!name || !email || !password || !location || !mobile_number) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert data into 'donors' table (wrapped in Promise)
        const query = 'INSERT INTO donors (name, email, password, location, mobile_number) VALUES (?, ?, ?, ?, ?)';
        const values = [name, email, hashedPassword, location, mobile_number];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error signing up:', err.message);
                return res.status(500).json({ error: 'Error signing up: ' + err.message });
            }
            res.status(201).json({ message: 'Donor signed up successfully!' });
        });

    } catch (err) {
        console.error('Error processing signup:', err.message);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
