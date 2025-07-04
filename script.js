$(document).ready(function () {
    console.log("script.js loaded");

    function loadEmployees() {
        $.get('http://127.0.0.1:5000/employees', function (data) {
            let rows = '';
            data.forEach(emp => {
                rows += `<tr data-id="${emp.id}">
                    <td>${emp.emp_name}</td>
                    <td>${emp.mobile}</td>
                    <td>${emp.email}</td>
                    <td>${emp.dept_name}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-btn" data-emp='${JSON.stringify(emp)}'>View</button>
                        <button class="btn btn-sm btn-warning edit-btn" data-emp='${JSON.stringify(emp)}'>Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                    </td>
                </tr>`;
            });
            $('#employeeTable tbody').html(rows);
        }).fail(function () {
            alert("Failed to fetch employees");
        });
    }

    loadEmployees();

    // View Employee
    $('#employeeTable').on('click', '.view-btn', function () {
        const emp = $(this).data('emp');
        const details = `
            <p><strong>Name:</strong> ${emp.emp_name}</p>
            <p><strong>Email:</strong> ${emp.email}</p>
            <p><strong>Mobile:</strong> ${emp.mobile}</p>
            <p><strong>Department:</strong> ${emp.dept_name}</p>
            <p><strong>Address:</strong> ${emp.address}</p>
            <p><strong>DOB:</strong> ${emp.dob}</p>
            <p><strong>DOJ:</strong> ${emp.doj}</p>
            <p><strong>Gender:</strong> ${emp.gender}</p>`;
        $('#viewModalBody').html(details);
        new bootstrap.Modal('#viewModal').show();
    });

    // Delete Employee
    let selectedEmpId;
    $('#employeeTable').on('click', '.delete-btn', function () {
        selectedEmpId = $(this).closest('tr').data('id');
        new bootstrap.Modal('#deleteConfirmModal').show();
    });

    $('#confirmDeleteBtn').click(function () {
        if (selectedEmpId) {
            $.ajax({
                url: `http://127.0.0.1:5000/employees/${selectedEmpId}`,
                type: 'DELETE',
                success: function () {
                    $('#deleteConfirmModal').modal('hide');
                    alert('Employee deleted successfully');
                    loadEmployees();
                },
                error: function () {
                    alert('Failed to delete employee');
                }
            });
        }
    });

    // Edit Employee
    $('#employeeTable').on('click', '.edit-btn', function () {
        const emp = $(this).data('emp');
        $('#editEmpId').val(emp.id);
        $('#editName').val(emp.emp_name);
        $('#editEmail').val(emp.email);
        $('#editMobile').val(emp.mobile);
        $('#editDept').val(emp.dept_name);
        $('#editAddress').val(emp.address);
        $('#editDob').val(emp.dob);
        $('#editDoj').val(emp.doj);
        $('#editGender').val(emp.gender);
        new bootstrap.Modal('#editModal').show();
    });

    // Update Employee
    $('#editForm').submit(function (e) {
        e.preventDefault();
        const empId = $('#editEmpId').val();
        const emp = {
            emp_name: $('#editName').val(),
            email: $('#editEmail').val(),
            mobile: $('#editMobile').val(),
            department: $('#editDept').val(),
            address: $('#editAddress').val(),
            dob: $('#editDob').val(),
            doj: $('#editDoj').val(),
            gender: $('#editGender').val()
        };
        $.ajax({
            url: `http://127.0.0.1:5000/employees/${empId}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(emp),
            success: function () {
                alert('Employee updated successfully');
                $('#editModal').modal('hide');
                loadEmployees();
            },
            error: function () {
                alert('Failed to update employee');
            }
        });
    });

});
