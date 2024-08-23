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

$('#login-password').on('keydown', (e) => {
    if (e.keyCode === 13)
        $('#btn-login').click();
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

// Input Tìm kiếm sản phẩm
$('#txt_search').on('focus', function () {
    $('.search-result').show();
}).on('blur', function () {
    setTimeout(() => { $('.search-result').hide(); }, 100);
}).keypress(function (e) {
    if (e.which === 13) {
        const currentUrl = new URL(window.location.origin + '/tim-kiem');
        const params = new URLSearchParams(currentUrl.search);
        params.set('name', this.value);
        const searchUrl = `${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`;
        Turbo.visit(searchUrl, { action: 'replace' });
    }
}).on('input', _.debounce(function () {
    $.ajax({
        type: "GET",
        url: "/tim-kiem/preview",
        data: { value: this.value, },
        success: (res) => {
            const resultsContainer = $('.search-result');
            resultsContainer.empty();

            if (res.success && res.data.length > 0) {
                res.data.forEach(product => {
                    const productElement = `
                        <a href="/san-pham/${product.Slugs}" class="d-flex text-decoration-none">
                            <img src="${product.Image}" class="me-3" style="width: 50px;">
                            <div>
                                <p class="text-black text-line-1" style="font-size: 14px;">${product.ProdName}</p>
                                <div class="d-flex align-items-center" style="font-size: 14px;">
                                    <strong class="text-danger me-2">${formatNumToCurrency(product.FinalPrice)}₫</strong>
                                    <p class="text-secondary text-decoration-line-through">${formatNumToCurrency(product.Price)}₫</p>
                                </div>
                            </div>
                        </a>
                    `;
                    resultsContainer.append(productElement);
                });
            } else {
                $('.search-result').html('<p>Không tìm thấy sản phẩm nào.</p>');
            }
        },
        error: (err) => {
            console.error(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
}, 500));