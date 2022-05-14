const cTable = require("console.table");
// Import and require mysql2
const mysql = require("mysql2");
const inquirer = require("inquirer");
const connection = require("./config/connection");
const { response } = require("express");

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

			if (choices === "View all employees") {
				viewAllEmployees();
			}
		});
};
// Function to view all employees in database
viewAllEmployees = () => {
	console.log("This is a comprehensive list of all employees in the company database");
	const sql = `SELECT employee_id,
                        employee.first_name,
                        employee.last_name,
                        role.title,
                        department.name AS department, 
                        role.salary,
                        rtrim(concat(manager.first_name + ' ', manager.last_name + ' '))
                        FROM employee, department, role
                        LEFT JOIN role
                        ON employee.role_id = role.id
                        LEFT JOIN department
                        ON role.department_id = department.id
                        LEFT JOIN manager
                        ON employee.manager_id = manager.id`;
	connection.promise().query(sql, (error, data) => {
		if (error) throw error;
		console.table(data);
		promptUser();
	});
};

promptUser();
