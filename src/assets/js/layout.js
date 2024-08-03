// Đăng ký tài khoản
$('#btn-register').on('click', () => {
    const data = {
        username: $('#register-username').val(),
        email: $('#register-email').val(),
        password: $('#register-password').val(),
        confirmPassword: $('#register-confirm-password').val()
    };

    if (!data.username || !data.email || !data.password || !data.confirmPassword) {
        $('#auth-alert').removeClass('d-none').find('div').text('Vui lòng điền đầy đủ thông tin');
        return;
    } else if (data.password !== data.confirmPassword)
        return;

    $.ajax({
        type: 'POST',
        url: '/auth/register',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        success: (res) => {
            if (res.success) {
                $('#login-tab').click();
                $('#auth-alert').addClass('d-none');
                $('#login-username').text(data.username);
                $('#login-password').text(data.password);
            }
        },
        error: (err) => {
            console.log(err);
            $('#auth-alert').removeClass('d-none').find('div').text(err.responseJSON.message);
        }
    });
});

// Đăng nhập tài khoản
$('#btn-login').on('click', () => {
    const data = {
        username: $('#login-username').val(),
        password: $('#login-password').val()
    };

    if (!data.username || !data.password) {
        $('#auth-alert').removeClass('d-none').find('div').text('Vui lòng điền đầy đủ thông tin');
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/auth/login',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        success: (res) => {
            console.log(res);

            if (res.success) {
                $('#auth-alert').addClass('d-none');
            }
        },
        error: (err) => {
            console.log(err);
            $('#auth-alert').removeClass('d-none').find('div').text(err.responseJSON.message);
        }
    });
});