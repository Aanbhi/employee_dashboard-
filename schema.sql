CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_name VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    active INTEGER NOT NULL,
    address VARCHAR(100) NOT NULL
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_name VARCHAR(50) NOT NULL,
    address VARCHAR(200) NOT NULL,
    mobile VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL,
    dob DATETIME NOT NULL,
    doj DATETIME NOT NULL,
    gender VARCHAR(2) NOT NULL,
    active INTEGER NOT NULL,
    dept_id INTEGER NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);
