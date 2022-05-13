const cTable = require("console.table");
// Import and require mysql2
const mysql = require("mysql2");
const inquirer = require("inquirer");

// Connect to database
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
