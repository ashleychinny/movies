const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite'); // Ensure this matches your database file path

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Tables in the database:");
        tables.forEach((table) => {
            console.log(table.name);
        });
    });
});

db.close();
