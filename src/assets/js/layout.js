// Đăng ký tài khoản
$('#btn-register').on('click', () => {
    $(this).addClass('disabled');

    const data = {
        username: $('#register-username').val(),
        email: $('#register-email').val(),
        password: $('#register-password').val(),
        confirmPassword: $('#register-confirm-password').val()
    };

    if (!data.username || !data.email || !data.password || !data.confirmPassword) {
        $('#auth-alert').removeClass('d-none').find('div').text('Vui lòng nhập đầy đủ thông tin');
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
            $(this).removeClass('disabled');
            if (res.success) {
                $('#login-tab').click();
                $('#auth-alert').addClass('d-none');
                $('#login-username').val(data.username);
                $('#login-password').val(data.password);
            }
        },
        error: (err) => {
            $(this).removeClass('disabled');
            console.log(err);
            $('#auth-alert').removeClass('d-none').find('div').text(err.responseJSON.message);
        }
    });
});

// Đăng nhập tài khoản
$('#btn-login').on('click', () => {
    $(this).addClass('disabled');

    const data = {
        username: $('#login-username').val(),
        password: $('#login-password').val()
    };

    if (!data.username || !data.password) {
        $('#auth-alert').removeClass('d-none').find('div').text('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/auth/login',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        success: (res) => {
            $(this).removeClass('disabled');
            $('#modal-auth').modal('hide');
            if (res.success) window.location.reload();
        },
        error: (err) => {
            $(this).removeClass('disabled');
            console.log(err);
            $('#auth-alert').removeClass('d-none').find('div').text(err.responseJSON.message);
        }
    });
});

// Đăng nhập bằng google
$('#btn-google').on('click', () => {
    const width = 530, height = 600;

    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const popup = window.open(
        '/auth/loginGoogle', 'google-login-popup',
        `width=${width},height=${height},top=${top},left=${left}`
    );

    if (window.focus && popup) popup.focus();

    window.addEventListener('message', (event) => {
        if (event.origin === window.location.origin && event.data.success) {
            popup.close(); window.location.reload();
        }
    });
});

// Đăng nhập bằng facebook
$('#btn-facebook').on('click', () => {
    const width = 750, height = 600;

    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const popup = window.open(
        '/auth/loginFacebook', 'facebook-login-popup',
        `width=${width},height=${height},top=${top},left=${left}`
    );

    if (window.focus && popup) popup.focus();

    window.addEventListener('message', (event) => {
        if (event.origin === window.location.origin && event.data.success) {
            popup.close(); window.location.reload();
        }
    });
});