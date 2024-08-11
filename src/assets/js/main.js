// Hàm tạo slugs cho tên sản phẩm
function formatToSlugs(str) {
    str = str.trim().toLowerCase(); // Chuyển đổi thành chữ thường
    // Đổi ký tự có dấu thành không dấu
    str = str.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    str = str.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    str = str.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    str = str.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    str = str.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    str = str.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    str = str.replace(/đ/gi, 'd');
    // Xóa các ký tự đặc biệt
    str = str.replace(/[`~!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/g, '');
    // Đổi khoảng trắng thành ký tự gạch ngang
    str = str.replace(/ +/g, '-');
    // Đổi nhiều ký tự gạch ngang liên tiếp thành một ký tự gạch ngang
    str = str.replace(/-{2,}/g, '-');
    return str;
}

// Lấy ngày từ loại datetime-local
function getDatetimeLocal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Hàm định dạng số xoá dấu .
function formatNumber(number) {
    return number.replace(/\./g, '');
}

// Hàm định dạng giá trị số thành tiền với các dấu .
function formatNumToCurrency(value) {
    value = value.replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(value);
}

// Hàm định dạng giá tị số thành văn bản tiền
function formatNumToCurrencyText(value) {
    value = value.replace(/\D/g, '');
    let number = parseInt(value, 10);
    if (isNaN(number) || number === 0) return '0';

    let result = '';
    let units = [' đồng ', ' nghìn ', ' triệu ', ' tỷ '];
    let thresholds = [1, 1000, 1000000, 1000000000];

    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (number >= thresholds[i]) {
            let quotient = Math.floor(number / thresholds[i]);
            if (quotient > 0) {
                result += quotient + units[i];
                number %= thresholds[i];
            }
        }
    }

    return result || '0';
}

// Hàm toast với bootstrap
function showToast(content, type, title) {
    const toastContainer = document.getElementById("toast-container");

    const typeClasses = {
        primary: "text-bg-primary", secondary: "text-bg-secondary", success: "text-bg-success", info: "text-bg-info",
        warning: "text-bg-warning", danger: "text-bg-danger", light: "text-bg-light", dark: "text-bg-dark"
    };

    function getDefaultTitle(type) {
        const titles = {
            primary: "Thành công", secondary: "Thành công", success: "Thành công", info: "Thông tin",
            warning: "Cảnh báo", danger: "Thất bại", light: "Thành công", dark: "Thành công"
        };
        return titles[type] || "Thành công";
    }

    const toast = document.createElement("div");
    toast.classList.add("toast", "align-items-center", "border-0", typeClasses[type] || "text-bg-primary");
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">${getDefaultTitle(type) || title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${content}</div>
    `;

    toastContainer.appendChild(toast);

    var myToast = new bootstrap.Toast(toast);
    myToast.show();

    toast.addEventListener('hidden.bs.toast', function () { toast.remove(); });
}