const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();

const db = new sqlite3.Database('C:\\Users\\chinay\\OneDrive - FANUC America Corporation\\Documents\\movies-1\\Database.sqlite'); // Use the absolute path

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files

// Create tables
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, title TEXT, year TEXT, genre TEXT, director TEXT, actors TEXT, plot TEXT, poster TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, movie_id TEXT, comment TEXT, rating INTEGER)");
});

// Save favorite movie
app.post('/favorites', (req, res) => {
    console.log('Received request to save favorite:', req.body); // Add this line
    const { id, title, year, genre, director, actors, plot, poster } = req.body;
    db.run("INSERT INTO favorites (id, title, year, genre, director, actors, plot, poster) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, title, year, genre, director, actors, plot, poster], (err) => {
        if (err) {
            console.error('Error saving favorite:', err.message); // Add this line
            return res.status(500).send(err.message);
        }
        res.status(200).send('Favorite saved!');
    });
});


// Get favorite movies
app.get('/favorites', (req, res) => {
    db.all("SELECT * FROM favorites", [], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});

// Save comment
app.post('/comments', (req, res) => {
    console.log('Received request to save comment:', req.body); // Add this line
    const { movie_id, comment, rating } = req.body;
    db.run("INSERT INTO comments (movie_id, comment, rating) VALUES (?, ?, ?)", [movie_id, comment, rating], (err) => {
        if (err) {
            console.error('Error saving comment:', err.message); // Add this line
            return res.status(500).send(err.message);
        }
        res.status(200).send('Comment saved!');
    });
});

// Get comments for a movie
app.get('/comments/:movie_id', (req, res) => {
    const movie_id = req.params.movie_id;
    db.all("SELECT * FROM comments WHERE movie_id = ?", [movie_id], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
