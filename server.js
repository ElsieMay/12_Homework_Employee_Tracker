const cTable = require("console.table");
// Import and require mysql2
const mysql = require("mysql2");
const inquirer = require("inquirer");
const connection = require("./config/connection");

// Uses inquirer to generate list of options

const promptUser = (connection) => {
	inquirer
		.prompt([
			{
				type: "list",
				name: "options",
				message: "What would you like to do?",
				choices: ["View all employees", "Add an employee", "Update an employee role", "View all roles", "Add a role", "View all departments", "Add a department", "Update employee managers", "View employees by manager", "View employees by department", "Delete department", "Delete role", "Delete employee", "View utilized budget", "Exit"],
			},
		])
		.then((answers) => {
			const { choices } = answers;
		});
};
