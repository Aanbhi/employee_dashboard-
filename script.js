from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DATABASE = 'database.db'

def connect_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/employees', methods=['GET'])
def get_employees():
    name = request.args.get('name', '').lower()
    mobile = request.args.get('mobile', '').lower()
    email = request.args.get('email', '').lower()
    department = request.args.get('department', '').lower()

    conn = connect_db()
    cursor = conn.cursor()

    query = '''
        SELECT e.id, e.emp_name, e.mobile, e.email, e.address, e.dob, e.doj, e.gender, d.dept_name 
        FROM employees e
        JOIN departments d ON e.dept_id = d.id
        WHERE 1=1
    '''
    params = []

    if name:
        query += ' AND LOWER(e.emp_name) LIKE ?'
        params.append(f'%{name}%')
    if mobile:
        query += ' AND LOWER(e.mobile) LIKE ?'
        params.append(f'%{mobile}%')
    if email:
        query += ' AND LOWER(e.email) LIKE ?'
        params.append(f'%{email}%')
    if department:
        query += ' AND LOWER(d.dept_name) LIKE ?'
        params.append(f'%{department}%')

    cursor.execute(query, params)
    employees = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(employees)

# Get all departments
@app.route('/departments', methods=['GET'])
def get_departments():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM departments')
    departments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(departments)

# Add a new employee
@app.route('/employees', methods=['POST'])
def add_employee():
    data = request.json
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM departments WHERE LOWER(dept_name) = LOWER(?)", (data['department'],))
    dept = cursor.fetchone()
    if not dept:
        return jsonify({'error': 'Department not found'}), 400

    cursor.execute('''
        INSERT INTO employees (emp_name, address, mobile, email, dob, doj, gender, active, dept_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('emp_name'),
        data.get('address', 'N/A'),
        data.get('mobile'),
        data.get('email'),
        data.get('dob', '2000-01-01'),
        data.get('doj', '2020-01-01'),
        data.get('gender', 'M'),
        1,
        dept['id']
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Employee added successfully'}), 201

# Edit an employee
@app.route('/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    data = request.json
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM departments WHERE LOWER(dept_name) = LOWER(?)", (data['department'],))
    dept = cursor.fetchone()
    if not dept:
        return jsonify({'error': 'Department not found'}), 400

    cursor.execute('''
        UPDATE employees
        SET emp_name = ?, address = ?, mobile = ?, email = ?, dob = ?, doj = ?, gender = ?, dept_id = ?
        WHERE id = ?
    ''', (
        data.get('emp_name'),
        data.get('address'),
        data.get('mobile'),
        data.get('email'),
        data.get('dob'),
        data.get('doj'),
        data.get('gender'),
        dept['id'],
        emp_id
    ))

    if cursor.rowcount == 0:
        return jsonify({'error': 'Employee not found'}), 404

    conn.commit()
    conn.close()
    return jsonify({'message': 'Employee updated successfully'})

# Delete an employee
@app.route('/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM employees WHERE id = ?', (emp_id,))

    if cursor.rowcount == 0:
        return jsonify({'error': 'Employee not found'}), 404

    conn.commit()
    conn.close()
    return jsonify({'message': 'Employee deleted successfully'})

# Add a new department
@app.route('/departments', methods=['POST'])
def add_department():
    data = request.json
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO departments (dept_name, type, active, address)
        VALUES (?, ?, ?, ?)
    ''', (
        data.get('dept_name'),
        data.get('type'),
        1,
        data.get('address')
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Department added successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)
