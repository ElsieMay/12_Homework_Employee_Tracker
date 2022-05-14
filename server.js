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
				name: "choices",
				message: "What would you like to do?",
				choices: ["View all employees", "Add an employee", "Update an employee role", "View all roles", "Add a role", "View all departments", "Add a department", "Update employee managers", "View employees by manager", "View employees by department", "Delete department", "Delete role", "Delete employee", "View utilized budget", "Exit"],
			},
		])
		.then((answers) => {
			const { choices } = answers;

			if (choices === "View all employees") {
				viewAllEmployees();
			}
			if (choices === "View all roles") {
				viewAllRoles();
			}
			if (choices === "View all departments") {
				viewAllDepartments();
			}
			if (choices === "Add an employee") {
				addAnEmployee();
			}
			if (choices === "Add a role") {
				addARole();
			}
			if (choices === "Add a department") {
				addADepartment();
			}
		});
};

// Function to view all employees in database
viewAllEmployees = () => {
	console.log("This is a comprehensive list of all employees in the company database");
	const sql = `SELECT employee.id,
                employee.first_name,
                employee.last_name,
                role.title,
                department.name AS department,
                role.salary,
                CONCAT(manager.first_name + ' ', manager.last_name + ' ') AS manager
                FROM employee
                LEFT JOIN role
                ON employee.role_id = role.id
                LEFT JOIN department
                ON role.department_id = department.id
                LEFT JOIN employee manager
                ON employee.manager_id = manager.id`;
	connection.query(sql, (error, data) => {
		if (error) throw error;
		console.table(data);
		promptUser();
	});
};

// Function to view all roles listed in company database
viewAllRoles = () => {
	console.log("Below are the roles listed for this company");
	const sql = `SELECT role.id,
                role.title,
                role.salary,
                department.name AS department
                FROM role
                LEFT JOIN department
                ON role.department_id = department.id`;
	connection.query(sql, (error, data) => {
		if (error) throw error;
		console.table(data);
		promptUser();
	});
};

// Function to view all departments listed in company database
viewAllDepartments = () => {
	console.log("Below are the departments listed for this company");
	const sql = `SELECT department.id AS id, 
                department.name AS department
                FROM department`;
	connection.query(sql, (error, data) => {
		if (error) throw error;
		console.table(data);
		promptUser();
	});
};

// Function to add an employee to database
addAnEmployee = () => {
	inquirer
		.prompt([
			{
				type: "input",
				name: "firstName",
				message: "Please enter the employee's first name",
				validate: (firstNameInput) => {
					if (firstNameInput) {
						return true;
					} else {
						console.log("An employee first name is required.");
						return false;
					}
				},
			},
			{
				type: "input",
				name: "lastName",
				message: "Please enter the employee's last name",
				validate: (laststNameInput) => {
					if (laststNameInput) {
						return true;
					} else {
						console.log("An employee last name is required.");
						return false;
					}
				},
			},
		])
		.then((answer) => {
			const employeeDetails = [answer.firstName, answer.lastName];

			const roleSelect = `SELECT role.id, role.title FROM role`;

			connection.query(roleSelect, (error, data) => {
				if (error) throw error;

				const roles = data.map(({ id, title }) => ({ name: title, value: id }));
				inquirer
					.prompt([
						{
							type: "list",
							name: "role",
							message: "What is the role of this employee?",
							choices: roles,
						},
					])
					.then((roleChoice) => {
						const role = roleChoice.role;

						employeeDetails.push(role);

						const managerSelect = `SELECT * FROM employee`;

						connection.query(managerSelect, (error, data) => {
							if (error) throw error;
							console.table(data);
							promptUser();

							const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name, value: id }));

							inquirer
								.prompt([
									{
										type: "list",
										name: "manager",
										message: "Who is this employee's manager?",
										choices: managers,
									},
								])

								.then((managerChoice) => {
									const manager = managerChoice.manager;

									employeeDetails.push(manager);

									const managerTbl = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;

									connection.query(managerTbl, employeeDetails, (error, result) => {
										if (error) throw error;
										console.log("New employee has been added to the database.");

										viewAllEmployees();
									});
								});
						});
					});
			});
		});
};

promptUser();
