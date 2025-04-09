const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite'); // Ensure this matches your database file path

db.serialize(() => {
    // Example query to fetch all favorites
    db.all("SELECT * FROM favorites", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Favorites:");
        rows.forEach((row) => {
            console.log(row);
        });
    });

    // Example query to fetch all comments
    db.all("SELECT * FROM comments", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Comments:");
        rows.forEach((row) => {
            console.log(row);
        });
    });
});

db.close();
