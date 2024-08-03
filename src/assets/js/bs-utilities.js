// Ẩn hiện mật khẩu cho form-password
document.querySelectorAll('.form-password').forEach(formPassword => {
    const btnShowPassword = formPassword.querySelector('button');
    const inputPassword = formPassword.querySelector('input');

    btnShowPassword.addEventListener('click', () => {
        if (inputPassword.type === 'password') {
            inputPassword.type = 'text';
            btnShowPassword.innerHTML = '<i class="bi bi-eye-slash"></i>';
        } else {
            inputPassword.type = 'password';
            btnShowPassword.innerHTML = '<i class="bi bi-eye"></i>';
        }
    });
});

// Kiểm tra giá trị xác nhận mật khẩu 
document.querySelectorAll('input[data-ps-confirm]').forEach(confirmPasswordInput => {
    confirmPasswordInput.addEventListener('input', () => {
        const passwordInputId = confirmPasswordInput.getAttribute('data-ps-confirm');
        const passwordInput = document.getElementById(passwordInputId);

        if (passwordInput && confirmPasswordInput.value === passwordInput.value)
            confirmPasswordInput.classList.remove('is-invalid');
        else
            confirmPasswordInput.classList.add('is-invalid');

    });
});