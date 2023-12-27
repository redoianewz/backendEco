const pool = require('../config/dbconnection');
const db = pool; 

const getUsers = (req, res) => {
    // ... (your existing code)

    // Use the db connection to query the database
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(result);
        }
    });
};  

const postUser = (req, res) => {
    const { name, email } = req.body;
    db.query('INSERT INTO users (name, email) VALUES (?, ?)', ['reda', 'ana@gmail.com'], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Internal Server Error: ' + err.message); // Send the error message in the response
        } else {
            res.sendStatus(200); // OK
        }
    });
};


const getUser= (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error querying user:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(result);
        }
    });
};

const putUser= (req, res) => {
    const userId = req.params.id;
    const { name, email } = req.body;
    db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.sendStatus(200); // OK
        }
    });
};

const deleteUser= (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.sendStatus(200); // OK
        }
    });
};

module.exports = {
    getUsers,
    postUser,
    getUser,
    putUser,
    deleteUser
};