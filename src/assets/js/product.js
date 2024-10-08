// Hàm định dạng tệp cấu hình
function formatProductTextCfg(input) {
    // Tách chuỗi văn bản thành các dòng
    const lines = input.split('\n');
    // Biến để lưu kết quả sau khi định dạng
    let formattedText = '';

    // Duyệt qua từng dòng và thực hiện thay thế
    lines.forEach(line => {
        if (line.trim()) {
            // Tách tiêu đề và giá trị
            const [key, ...valueParts] = line.split('\t');
            // Nối các phần của giá trị lại với nhau
            const value = valueParts.join('\t').trim();
            // Định dạng lại theo yêu cầu và thêm vào kết quả
            formattedText += `${key.trim()};\t${value}\n`;
        }
    });

    // Xóa các dòng trống và trả về kết quả
    return formattedText.trim();
}

// Hàm nhập tệp cấu hình cho bảng
function importProductCfg(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        const [title, description] = line.split(';').map(item => item.trim());
        if (title && description) {
            $('#tbl-product-cfg tbody').append(
                $('<tr>').append(
                    $('<td>', { class: 'text-nowrap', text: title }),
                    $('<td>', { text: description })
                )
            );
        }
    });
}

// Lấy nội dung cấu hình sản phẩm khi load trang
$('#btn-show-product-cfg').on("click", () => {
    importProductCfg($('#txt-product-cfg').val());
});

// Đặt chiều cao cho thẻ product content
$(document).ready(function () {
    $('#product-content').height(
        $('#sidebar-product-details').height() - 24 - 24
    );
});

// Sự kiện nút xem thêm thông tin
$('#btn-show-more').on('click', function () {
    $(this).closest('.show-more-content').addClass('d-none');
    $('#product-content').removeClass('overflow-hidden').css('height', '100%');
});


// Chức năng chọn rating
var selectedIndex = -1;
function updateStars(index, selected = false) {
    $('#rating-star .fa-star').removeClass('text-warning selected');
    if (index >= 0) {
        $('#rating-star .fa-star').slice(0, index + 1).addClass('text-warning');
        $('#rating-text').text(['Rất tệ', 'Tệ', 'Bình thường', 'Hài lòng', 'Rất hài lòng'][index] || '');
    } else $('#rating-text').text('');

    if (selected) {
        $('#rating-star .fa-star').slice(0, index + 1).addClass('selected');
        selectedIndex = index;
    }
}

$('#rating-star .fa-star').on('mouseover', function () { updateStars($(this).index()); });
$('#rating-star .fa-star').on('mouseout', function () { updateStars(selectedIndex); });
$('#rating-star .fa-star').on('click', function () { updateStars($(this).index(), true); });

// Hàm lấy số sao đã chọn
function getSelectedRating() { return selectedIndex + 1; }


// Nút gửi đánh giá sản phẩm
$('#btn-product-review').on('click', function () {
    const data = {
        rating: getSelectedRating(),
        comment: $('#product-review-comment').val(),
        userName: $('#product-review-username').val(),
        productId: $('#prdId').text()
    };

    $.ajax({
        type: 'POST',
        url: 'danh-gia',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        success: function (res) {
            if (res.success) {
                showToast(res.message, 'success');
                $('#modal-product-review').modal('hide');
            }
        },
        error: function (err) {
            showToast(err.responseJSON.message, 'danger');
        }
    });
});

// Chức hiển thị tổng số sao đánh giá của sản phẩm
$(document).ready(function () {
    const rating = parseFloat($('#product-rating-average').text().split('/')[0]);
    const ratingContainer = $('.star-rating');
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const maxStars = 5;

    let starsHtml = '';

    for (let i = 1; i <= maxStars; i++) {
        if (i <= fullStars) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-o"></i><i class="fas fa-star unrated"></i>';
        } else {
            starsHtml += '<i class="fas fa-star unrated"></i>';
        }
    }

    ratingContainer.html(starsHtml);
});

// Chức năng hiển thị số sao đánh giá từ người dùng
$(document).ready(function () {
    $('.userRating').each(function () {
        const rating = $(this).data('rating');
        $(this).find('i').each(function (index) {
            if (index < rating) {
                $(this).addClass('text-warning');
            }
        });
    });
});



// ------------------ Các sự kiện lọc sản phẩm --------------------------------------------- 

// Hàm đặt các tham số mặt định khi load trang
function setDefaultParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('sort')) $('#sort-product').val(urlParams.get('sort'));
    $(`input[name="filter-price"][data-params="${urlParams.get('price')}"]`).prop('checked', true);
    $(`input[name="filter-cpu"][data-params="${urlParams.get('cpu')}"]`).prop('checked', true);
    $(`input[name="filter-ram"][data-params="${urlParams.get('ram')}"]`).prop('checked', true);
    $(`input[name="filter-vga"][data-params="${urlParams.get('vga')}"]`).prop('checked', true);
    $(`input[name="filter-demand"][data-params="${urlParams.get('demand')}"]`).prop('checked', true);
} setDefaultParams();

// Hàm tạo url truy vấn với các tham số
function getUrlParams(paramName = '', paramValue = '') {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    params.set(paramName, paramValue);
    return `${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`;
}

// Truyền tham số truy vấn vào url 
$('#sort-product').on('change', function () {
    const newUrl = getUrlParams('sort', this.value);
    Turbo.visit(newUrl, { frame: 'product-container', action: 'replace' });
});

// Sự kiện cập nhật url với các tham số
$(`input[name="filter-price"], input[name="filter-cpu"], input[name="filter-ram"], 
    input[name="filter-vga"], input[name="filter-demand"]`).on('change', function () {
    const name = $(this).attr('name').split('-')[1];
    const newUrl = getUrlParams(name, $(this).data('params'));
    Turbo.visit(newUrl, { frame: 'product-container', action: 'replace' });
});

// Sự kiện cập nhật url với các tham số
$('button[name="btn-filter-brands"]').on('click', function () {
    const newUrl = getUrlParams('brand', $(this).data('params'));
    Turbo.visit(newUrl, { frame: 'product-container', action: 'replace' });
});

// Hàm cho nút xem thêm sản phẩm
function viewMoreProduct() {
    const newUrl = getUrlParams("count", $('#product-count').text().trim());
    Turbo.visit(newUrl, { frame: 'product-container', action: 'replace' });
};

// -------------------------------------------------------------------------


function addProductToCart(buyNow = false) {
    $.ajax({
        type: "POST",
        url: "/gio-hang/create",
        data: JSON.stringify({ productId: $('#prdId').text() }),
        dataType: 'json',
        contentType: "application/json",
        success: function (res) {
            if (res.success) {
                if (buyNow)
                    return Turbo.visit(window.location.href = '/gio-hang', { action: "replace" });

                showToast(res.message, 'success');
                let cartCount = parseInt($('#cart-count').text());
                $('#cart-count').text(cartCount + 1);
            } else {
                showToast(res.message, 'warning');
            }
        },
        error: function (err) {
            console.error(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
}