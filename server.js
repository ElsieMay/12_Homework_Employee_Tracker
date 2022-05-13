const cTable = require("console.table");
// Import and require mysql2
const mysql = require("mysql2");
const inquirer = require("inquirer");
let express = require("express");
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create connection
const db = mysql.createConnection(
	{
		host: "localhost",
		// MySQL username,
		user: "root",
		// TODO: Add MySQL password here
		password: "Beachball1",
		database: "company_db",
	},
	console.log(`Connected to the company_db database.`)
);
// Connect to MySQL
db.connect((err) => {
	if (err) {
		throw err;
	}
	console.log("MySQL connected");
});

// Create Database
app.get("/createdb", (req, res) => {
	const sql = `CREATE DATABASE node MySQL`;

	db.query(sql, (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
			return;
		}
		res.json({
			message: "success",
		});
	});
});
