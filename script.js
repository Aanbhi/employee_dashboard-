$(document).ready(function () {
    console.log("script.js loaded");

    // Load employees (optionally with search params)
    function loadEmployees(params = {}) {
        $.get('http://127.0.0.1:5000/employees', params, function (data) {
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

    // Initial load
    loadEmployees();

    // Search form submit
    $('#searchForm').submit(function (e) {
        e.preventDefault();

        const name = $('input[name="Employee name"]').val().trim();
        const mobile = $('input[name="Mobile"]').val().trim();
        const email = $('input[name="Email"]').val().trim();
        const department = $('input[name="Department"]').val().trim();

        const params = {};
        if (name) params.name = name;
        if (mobile) params.mobile = mobile;
        if (email) params.email = email;
        if (department) params.department = department;

        loadEmployees(params);  
    });

    // Otherwise, search with provided values
    $.get('http://127.0.0.1:5000/employees/search', {
        name: name,
        mobile: mobile,
        email: email,
        department: department
    }, function (data) {
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
        alert("Failed to search employees");
    });

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

        const viewModalEl = document.getElementById('viewModal');
        const viewModal = bootstrap.Modal.getOrCreateInstance(viewModalEl);
        viewModal.show();
    });

    // Delete Employee
    let selectedEmpId;
    $('#employeeTable').on('click', '.delete-btn', function () {
        selectedEmpId = $(this).closest('tr').data('id');
        const deleteModalEl = document.getElementById('deleteConfirmModal');
        const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
        deleteModal.show();
    });

    $('#confirmDeleteBtn').click(function () {
        if (selectedEmpId) {
            $.ajax({
                url: `http://127.0.0.1:5000/employees/${selectedEmpId}`,
                type: 'DELETE',
                success: function () {
                    const deleteModalEl = document.getElementById('deleteConfirmModal');
                    const deleteModal = bootstrap.Modal.getInstance(deleteModalEl);
                    deleteModal.hide();
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
        $('#editAddress').val(emp.address || '');
        $('#editDob').val(emp.dob || '');
        $('#editDoj').val(emp.doj || '');
        $('#editGender').val(emp.gender || '');

        const editModalEl = document.getElementById('editModal');
        const editModal = bootstrap.Modal.getOrCreateInstance(editModalEl);
        editModal.show();
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
                const editModalEl = document.getElementById('editModal');
                const editModal = bootstrap.Modal.getInstance(editModalEl);
                editModal.hide();
                alert('Employee updated successfully');
                loadEmployees();
            },
            error: function (res) {
                console.error(res);
                alert(res.responseJSON?.error || 'Failed to update employee');
            }
        });
    });
});

