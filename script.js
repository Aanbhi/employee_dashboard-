$(document).ready(function () {
    console.log("script.js loaded");

    let currentPage = 1;
    const perPage = 5;
    let isManualSearch = true; // Flag to prevent page reset on pagination click

    // Load employees with filters & pagination
    function loadEmployees(params = {}) {
        params.page = currentPage;
        params.per_page = perPage;

        console.log("Loading page:", currentPage); // Debugging log

        $.get('http://127.0.0.1:5000/employees', params, function (response) {
            let rows = '';
            response.data.forEach(emp => {
                rows += `<tr data-id="${emp.id}">
                    <td>${emp.emp_name}</td>
                    <td>${emp.mobile}</td>
                    <td>${emp.email}</td>
                    <td>${emp.dept_name}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-btn"
                            data-id="${emp.id}" data-name="${emp.emp_name}" data-email="${emp.email}"
                            data-mobile="${emp.mobile}" data-dept="${emp.dept_name}" data-address="${emp.address || ''}"
                            data-dob="${emp.dob || ''}" data-doj="${emp.doj || ''}" data-gender="${emp.gender || ''}">
                            View</button>
                        <button class="btn btn-sm btn-warning edit-btn"
                            data-id="${emp.id}" data-name="${emp.emp_name}" data-email="${emp.email}"
                            data-mobile="${emp.mobile}" data-dept="${emp.dept_name}" data-address="${emp.address || ''}"
                            data-dob="${emp.dob || ''}" data-doj="${emp.doj || ''}" data-gender="${emp.gender || ''}">
                            Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                    </td>
                </tr>`;
            });
            $('#employeeTable tbody').html(rows);
            renderPagination(response.total_pages, response.current_page);
        }).fail(function () {
            alert("Failed to fetch employees");
        });
    }

    // Render pagination buttons
    function renderPagination(totalPages, current) {
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#">${i}</a>
                     </li>`;
        }
        $('#pagination').html(html);
    }

    // Handle pagination click
    $('#pagination').on('click', 'a', function (e) {
        e.preventDefault();
        const selectedPage = parseInt($(this).text());
        if (selectedPage !== currentPage) {
            currentPage = selectedPage;
            isManualSearch = false;
            $('#searchForm').submit();
            isManualSearch = true;
        }
    });

    // Handle search form submit
    $('#searchForm').submit(function (e) {
        e.preventDefault();

        if (isManualSearch) currentPage = 1;

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

    // Initial load
    loadEmployees();

    // View Employee
    $('#employeeTable').on('click', '.view-btn', function () {
        const $btn = $(this);
        const details = `
            <p><strong>Name:</strong> ${$btn.data('name')}</p>
            <p><strong>Email:</strong> ${$btn.data('email')}</p>
            <p><strong>Mobile:</strong> ${$btn.data('mobile')}</p>
            <p><strong>Department:</strong> ${$btn.data('dept')}</p>
            <p><strong>Address:</strong> ${$btn.data('address')}</p>
            <p><strong>DOB:</strong> ${$btn.data('dob')}</p>
            <p><strong>DOJ:</strong> ${$btn.data('doj')}</p>
            <p><strong>Gender:</strong> ${$btn.data('gender')}</p>
        `;
        $('#viewModalBody').html(details);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('viewModal')).show();
    });

    // Delete Employee
    let selectedEmpId;
    $('#employeeTable').on('click', '.delete-btn', function () {
        selectedEmpId = $(this).closest('tr').data('id');
        bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteConfirmModal')).show();
    });

    $('#confirmDeleteBtn').click(function () {
        if (selectedEmpId) {
            $.ajax({
                url: `http://127.0.0.1:5000/employees/${selectedEmpId}`,
                type: 'DELETE',
                success: function () {
                    bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
                    alert('Employee deleted successfully');
                    $('#searchForm').submit();
                },
                error: function () {
                    alert('Failed to delete employee');
                }
            });
        }
    });

    // Edit Employee
    $('#employeeTable').on('click', '.edit-btn', function () {
        const $btn = $(this);
        $('#editEmpId').val($btn.data('id'));
        $('#editName').val($btn.data('name'));
        $('#editEmail').val($btn.data('email'));
        $('#editMobile').val($btn.data('mobile'));
        $('#editDept').val($btn.data('dept'));
        $('#editAddress').val($btn.data('address'));
        $('#editDob').val($btn.data('dob'));
        $('#editDoj').val($btn.data('doj'));
        $('#editGender').val($btn.data('gender'));

        $('#editForm').removeClass('was-validated');
        bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal')).show();
    });

    // Update Employee
    $('#editForm').submit(function (e) {
        e.preventDefault();
        const form = this;
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const empId = $('#editEmpId').val();
        const emp = {
            emp_name: $('#editName').val().trim(),
            email: $('#editEmail').val().trim(),
            mobile: $('#editMobile').val().trim(),
            department: $('#editDept').val().trim(),
            address: $('#editAddress').val().trim(),
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
                bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                alert('Employee updated successfully');
                $('#searchForm').submit();
            },
            error: function (res) {
                console.error(res);
                alert(res.responseJSON?.error || 'Failed to update employee');
            }
        });
    });
});
