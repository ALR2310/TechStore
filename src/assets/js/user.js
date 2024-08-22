// Sự kiện đặt class cho profile menu
$(document).ready(function () {
    $('.profile-menu-left').on('click', function (event) {
        const href = $(this).attr('href');

        if (href !== '/auth/logout') {
            event.preventDefault();
            var target = $(this).attr('href');

            $('.tab-pane').removeClass('show active');
            $(target).addClass('show active');

            $('.profile-menu-left').removeClass('active');
            $(this).addClass('active');

            if (history.pushState) history.pushState(null, null, target);
            else location.hash = target;
        }
    });

    var hash = window.location.hash || '#profile';
    $('.profile-menu-left[href="' + hash + '"]').trigger('click');
});

// Nút lưu thông tin người dùng
$('#btn-profile-save').on('click', function () {
    const data = {
        fullName: $('#profile-fullName').val(),
        gender: $('input[name="profile-gender"]:checked').val(),
        phoneNumber: $('#profile-phoneNumber').val(),
        email: $("#profile-email").val(),
        dateOfBirth: $('#profile-dateOfBirth').val()
    };

    $.ajax({
        type: "POST",
        url: "/tai-khoan/update",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        success: function (res) {
            if (res.success)
                showToast(res.message, 'success');
        },
        error: function (err) {
            console.error(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
});