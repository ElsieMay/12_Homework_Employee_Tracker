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
			if (choices === "Update an employee role") {
				updateEmployeeRole();
			}
			if (choices === "Update employee managers") {
				updateEmployeeManager();
			}
			if (choices === "View employees by manager") {
				viewEmployeesByManager();
			}
			if (choices === "View employees by department") {
				viewEmployeesByDepartment();
			}
			if (choices === "View utilized budget") {
				viewUtilizedBudget();
			}
			if (choices === "Delete department") {
				deleteDepartment();
			}
			if (choices === "Delete role") {
				deleteRole();
			}
			if (choices === "Delete employee") {
				deleteEmployee();
			}
			if (choices === "Exit") {
				connection.end();
			}
		});
};

// Function to view all employees in database
const viewAllEmployees = () => {
	console.log("This is a comprehensive list of all employees in the company database");
	const sql = `SELECT employee.id,
                employee.first_name,
                employee.last_name,
                role.title,
                department.name AS department,
                role.salary,
                CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                FROM employee
                LEFT JOIN role
                ON employee.role_id = role.id
                LEFT JOIN department
                ON role.department_id = department.id
                LEFT JOIN employee manager
                ON manager.id = employee.manager_id`;
	connection.query(sql, (error, data) => {
		if (error) throw error;
		console.table(data);
		promptUser();
	});
};

// Function to view all roles listed in company database
const viewAllRoles = () => {
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
const viewAllDepartments = () => {
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
const addAnEmployee = () => {
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

// Function to add a role to database
const addARole = () => {
	inquirer
		.prompt([
			{
				type: "input",
				name: "roleType",
				message: "What is the name of this new role?",
				validate: (roleTypeInput) => {
					if (roleTypeInput) {
						return true;
					} else {
						console.log("A role name is required.");
						return false;
					}
				},
			},
			{
				type: "input",
				name: "roleSalary",
				message: "What is the salary of this role?",
				validate: (roleSalaryInput) => {
					if (roleSalaryInput) {
						return true;
					} else {
						console.log("A role salary is required.");
						return false;
					}
				},
			},
		])
		.then((answer) => {
			const roleDetails = [answer.roleType, answer.roleSalary];

			const depSelect = `SELECT name, id FROM department`;

			connection.query(depSelect, (error, data) => {
				if (error) throw error;

				const departments = data.map(({ name, id }) => ({ name: name, value: id }));
				inquirer
					.prompt([
						{
							type: "list",
							name: "departments",
							message: "What department does the role belong to?",
							choices: departments,
						},
					])
					.then((depChoice) => {
						const departments = depChoice.departments;

						roleDetails.push(departments);

						const depSql = `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`;

						connection.query(depSql, roleDetails, (error, result) => {
							if (error) throw error;
							console.table(data);
							viewAllRoles();
						});
					});
			});
		});
};

// Function to add a department to database
const addADepartment = () => {
	inquirer
		.prompt([
			{
				type: "input",
				name: "depType",
				message: "What is the name of the department?",
				validate: (depTypeInput) => {
					if (depTypeInput) {
						return true;
					} else {
						console.log("A department name is required.");
						return false;
					}
				},
			},
		])
		.then((answer) => {
			const depSql = `INSERT INTO department (name)
        VALUES (?)`;

			connection.query(depSql, answer.depType, (error, result) => {
				if (error) throw error;
				console.table(result);
				viewAllDepartments();
			});
		});
};

// Function to update an employee's role in the database
const updateEmployeeRole = () => {
	//SELECT employee and role values from table
	let employeeSql = `SELECT employee.first_name, 
                        employee.last_name,
                        employee.id,
                        role.id 
                        AS "role_id" 
                        FROM employee, role, department 
                        WHERE department.id = role.department_id 
                        AND role.id = employee.role_id`;
	connection.query(employeeSql, (error, response) => {
		if (error) {
			return console.error(error.message);
		}
		// Array of employee names
		const employeeArray = response.map(
			(employee) =>
				// response.forEach((employee) => {
				`${employee.first_name} ${employee.last_name}`
		);
		//SELECT role values from table
		let employeeSql = `SELECT role.id, role.title FROM role`;
		connection.query(employeeSql, (error, response) => {
			if (error) {
				return console.error(error.message);
			}
			const roleArray = [];
			response.forEach((role) => {
				roleArray.push(role.title);
			});

			// Prompt to select employee
			inquirer
				.prompt([
					{
						type: "list",
						name: "employeeList",
						message: "What employee would you like to update?",
						choices: employeeArray,
					},
					{
						type: "list",
						name: "newRole",
						message: "What would you like to update their role to?",
						choices: roleArray,
					},
				])
				.then((answer) => {
					let updatedRole, empId;

					response.forEach((role) => {
						if (answer.newRole === role.title) {
							updatedRole = role.id;
						}
					});

					response.forEach((employee) => {
						if (answer.employeeList === `${employee.first_name} ${employee.last_name}`) {
							empId = employee.id;
						}
					});

					const sql = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
					connection.query(sql, [updatedRole, empId], (error, response) => {
						if (error) {
							return console.error(error.message);
						}
						console.log("Employee role has been added");
						console.table(response);
						viewAllEmployees();
					});
				});
		});
	});
};

// Function to update an employee's role in the database
const updateEmployeeManager = () => {
	//SELECT employee and role values from table
	let managerSql = `SELECT employee.first_name, 
                        employee.last_name,
                        employee.id,
                        employee.manager_id
                        FROM employee`;
	connection.query(managerSql, (error, response) => {
		if (error) {
			return console.error(error.message);
		}
		// Array of employee names
		const employeeArray = response.map((employee) => `${employee.first_name} ${employee.last_name}`);
		// Prompt to select employee
		inquirer
			.prompt([
				{
					type: "list",
					name: "employeeList",
					message: "What employee would you like to update?",
					choices: employeeArray,
				},
				{
					type: "list",
					name: "updatedManager",
					message: "Who would you like to update their manager to?",
					choices: employeeArray,
				},
			])
			.then((answer) => {
				let employeeSelected, managerId;

				response.forEach((employee) => {
					if (answer.employeeList === `${employee.first_name} ${employee.last_name}`) {
						employeeSelected = employee.id;
					}
					if (answer.updatedManager === `${employee.first_name} ${employee.last_name}`) {
						managerId = employee.id;
					}
				});

				const sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;
				connection.query(sql, [employeeSelected, managerId], (error, response) => {
					if (error) {
						return console.error(error.message);
					}
					console.table(response);
					console.log("Employee's manager has been added");
					viewAllEmployees();
				});
			});
	});
};

// Function to view employees by manager
const viewEmployeesByManager = () => {
	//SELECT employees and their departments from table
	const empDepartmentSql = `SELECT employee.id,
                            employee.first_name,
                            employee.last_name,
                            CONCAT(manager.first_name + ' ', manager.last_name + ' ') AS manager
                            FROM employee
                            LEFT JOIN employee manager
                            ON employee.manager_id = manager.id`;
	connection.query(empDepartmentSql, (error, response) => {
		if (error) {
			return console.error(error.message);
		}
		console.table(response);
		console.log("Viewing employees by manager");
		promptUser();
	});
};

// Function to view employees by department
const viewEmployeesByDepartment = () => {
	//SELECT from list of departments
	const depSelect = `SELECT name, id FROM department`;

	connection.query(depSelect, (error, data) => {
		if (error) throw error;

		const departments = data.map(({ name, id }) => ({ name: name, value: id }));
		inquirer
			.prompt([
				{
					type: "list",
					name: "departments",
					message: "What department does the role belong to?",
					choices: departments,
				},
			])
			.then((response) => {
				const departmentId = response.departments;
				const empDepartmentSql = `SELECT employee.id, 
                                          employee.first_name, 
                                          employee.last_name, 
                                          role.title 
                                          FROM employee 
                                          LEFT JOIN role on employee.role_id  = role.id 
                                          LEFT JOIN department department on role.department_id = department.id 
                                          WHERE department.id = ?`;
				connection.query(empDepartmentSql, departmentId, (error, response) => {
					if (error) {
						return console.error(error.message);
					}
					console.table(response);
					console.log("Viewing employees by department");
					promptUser();
				});
			});
	});
};

// Function to view employees by department
const viewUtilizedBudget = () => {
	//SELECT employees and their departments from table
	const empDepartmentSql = `SELECT department_id
                             AS id,
                             department.name AS department,
                             SUM (salary)
                             AS budget
                             FROM role
                             LEFT JOIN department
                             ON role.department_id = department.id
                             GROUP BY department_id`;
	connection.query(empDepartmentSql, (error, response) => {
		if (error) {
			return console.error(error.message);
		}
		console.table(response);
		console.log("Viewing employees by department");
		promptUser();
	});
};

// Function to delete a department
const deleteDepartment = () => {
	//SELECT from list of departments
	const depSelect = `SELECT department.id, department.name FROM department AS department`;

	connection.query(depSelect, (error, data) => {
		if (error) throw error;

		const departments = data.map(({ name, id }) => ({ name: name, value: id }));
		inquirer
			.prompt([
				{
					type: "list",
					name: "departments",
					message: "What department would you like to delete?",
					choices: departments,
				},
			])
			.then((response) => {
				const departmentId = response.departments;
				const empDepartmentSql = `DELETE 
                                          FROM department 
                                          WHERE department.id = ?`;
				connection.query(empDepartmentSql, departmentId, (error, response) => {
					if (error) {
						return console.error(error.message);
					}
					console.log("Department has been removed");
					viewAllDepartments();
				});
			});
	});
};

// Function to delete a role
const deleteRole = () => {
	//SELECT from list of departments
	const depSelect = `SELECT role.id, role.title FROM role AS role`;

	connection.query(depSelect, (error, data) => {
		if (error) throw error;

		const role = data.map(({ title, id }) => ({ name: title, value: id }));
		inquirer
			.prompt([
				{
					type: "list",
					name: "role",
					message: "What role would you like to delete?",
					choices: role,
				},
			])
			.then((response) => {
				const roleId = response.role;
				const roleSql = `DELETE 
                                FROM role 
                                WHERE role.id = ?`;
				connection.query(roleSql, roleId, (error, response) => {
					if (error) {
						return console.error(error.message);
					}
					console.log("This role has been removed");
					viewAllRoles();
				});
			});
	});
};

const deleteEmployee = () => {
	//SELECT from list of departments
	const empSelect = `SELECT employee.id, employee.first_name, employee.last_name FROM employee AS employee`;

	connection.query(empSelect, (error, data) => {
		if (error) throw error;

		const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
		inquirer
			.prompt([
				{
					type: "list",
					name: "employees",
					message: "What employee would you like to delete?",
					choices: employees,
				},
			])
			.then((response) => {
				const empId = response.employees;
				const empSql = `DELETE 
                                FROM employee 
                                WHERE employee.id = ?`;
				connection.query(empSql, empId, (error, response) => {
					if (error) {
						return console.error(error.message);
					}
					console.log("Employee has been removed");
					viewAllEmployees();
				});
			});
	});
};

promptUser();
