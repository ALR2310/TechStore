// Phụ thuộc FontAwesome

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

// Tạo mũi tên cho nút đóng mở collapse
document.querySelectorAll('[aria-expanded-icon]').forEach(function (element) {
    const isExpanded = element.getAttribute('aria-expanded-icon') === 'true';
    const icon = document.createElement('i');
    icon.classList.add('fa-regular', 'fa-chevron-up');

    if (!isExpanded) {
        icon.classList.add('fa-rotate-180');
    }

    element.appendChild(icon);

    element.addEventListener('click', function () {
        const currentIcon = element.querySelector('i.fa-chevron-up');
        currentIcon.classList.toggle('fa-rotate-180');
        element.setAttribute('aria-expanded-icon', currentIcon.classList.contains('fa-rotate-180') ? 'false' : 'true');
    });
});

// Tạo chức năng tăng giảm số trên thẻ input-group-number
document.querySelectorAll('.input-group-number').forEach(function (group) {
    const input = group.querySelector('input');
    const btnMinus = group.querySelector('button:first-child');
    const btnPlus = group.querySelector('button:last-child');

    btnMinus.addEventListener('click', function () {
        let currentValue = parseInt(input.value);
        if (currentValue > parseInt(input.min))
            input.value = currentValue - 1;
    });

    btnPlus.addEventListener('click', function () {
        let currentValue = parseInt(input.value);
        if (currentValue < parseInt(input.max))
            input.value = currentValue + 1;
    });
});