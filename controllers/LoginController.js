const connectDB = require('../config/dbconnection');
const db = connectDB(); 


const getLogin =  (req, res) => {
    const { username, password } = req.body;
  
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    connection.query(query, [username, password], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          res.status(200).json({ message: 'Login successful' });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      }
    });
  };

  const SignUp = (req, res) => {
    const { username, email,
        password,confirm_password, photo
    } = req.body;
  
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, password], (err) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      } else {
        res.status(201).json({ message: 'Signup successful' });
      }
    });
  };

    module.exports = {
        getLogin,
        SignUp
    };