const btnShowPassword = document.querySelector(".form-password button");
const inputPassword = document.querySelector(".form-password input");

btnShowPassword.addEventListener("click", () => {
    if (inputPassword.type === "password") {
        inputPassword.type = "text";
        btnShowPassword.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
        inputPassword.type = "password";
        btnShowPassword.innerHTML = '<i class="bi bi-eye"></i>';
    }
})