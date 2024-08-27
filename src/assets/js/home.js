// ------------------ Các sự kiện lọc sản phẩm trên trang tìm kiếm--------------------------------------------- 

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
$(`input[name="filter-price"]`).on('change', function () {
    const name = $(this).attr('name').split('-')[1];
    const newUrl = getUrlParams(name, $(this).data('params'));
    Turbo.visit(newUrl, { frame: 'product-container', action: 'replace' });
});

// Hàm cho nút xem thêm sản phẩm
function viewMoreProduct() {
    const newUrl = getUrlParams("count", $('#product-count').text().trim());
    Turbo.visit(newUrl, { frame: 'product-container', action: 'replace' });
};


//----------------------Trang giỏ hàng------------------------------

$('input[name="cart-address"]').on('focus', function () {
    $(this).closest('.input-group').addClass('bs-focus');
}).on('blur', function () {
    $(this).closest('.input-group').removeClass('bs-focus');
});

var currentStep = 0;
var steps = ['#cart-order', '#cart-info', '#cart-pay', '#cart-complete'];
var $cartStatusItems = $('.cart-status-item');

// Sự kiện click cho nút đặt hàng
$('#btn-cart-order').on('click', function () {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateStep(currentStep);
    }
});

// Sự kiện click cho nút Quay lại
$('#btn-cart-back').on('click', function () {
    if (currentStep > 0) {
        currentStep--;
        updateStep(currentStep);
    } else {
        window.location.href = "/";
    }
});

// Hàm cập nhật giao diện khi chuyển bước
function updateStep(step) {
    $(steps.join(',')).addClass('d-none');
    $(steps[step]).removeClass('d-none');

    $cartStatusItems.removeClass('active');
    $cartStatusItems.each(function (index) {
        if (index <= step) $(this).addClass('active');
    });

    switch (step) {
        case 0: handleCartOrder(); break;
        case 1: handleCartInfo(); break;
        case 2: handleCartPay(); break;
        case 3: handleCartComplete(); break;
    }
} updateStep(currentStep);

// Hàm xử lý khi ở bước Order
function handleCartOrder(delay = 0) {
    setTimeout(() => {
        const prdPrice = $('.cart-order-price');
        let totalPrice = 0;

        prdPrice.each(function (index) {
            let priceText = $(this).text().replace(/\./g, '').replace('₫', '');
            let price = parseFloat(priceText);
            let quantity = parseInt($('.cart-order-quantity').eq(index).val());
            totalPrice += price * quantity;
        });

        $('#cart-total-price').text(formatNumToCurrency(totalPrice) + '₫');
    }, delay);
}

// Hàm xử lý khi ở bước Info
var cartItems;
function handleCartInfo() {
    cartItems = [];

    $('#cart-order .row').each(function () {
        const cartId = $(this).data('cart');
        const prodId = $(this).data('prod');
        const quantity = $(this).find('.cart-order-quantity').val();

        cartItems.push({
            id: cartId,
            prodId: prodId,
            quantity: parseInt(quantity)
        });
    });

    $.ajax({
        type: "POST",
        url: "/gio-hang/update",
        data: JSON.stringify(cartItems),
        dataType: "json",
        contentType: "application/json",
        error: function (err) {
            console.log(err);
            showToast(err.responseJSON.message, 'error');
        }
    });
}

// Hàm xử lý khi ở bước Pay
function handleCartPay() {
    const infoContainer = $('input[name="cart-info-address"]:checked').closest('.cart-info');
    $('#cart-pay-name').text(infoContainer.find('.cart-info-name').text());
    $('#cart-pay-phone').text(infoContainer.find('.cart-info-phone').text());
    $('#cart-pay-address').text(infoContainer.find('.cart-info-address').text());
    $('#cart-pay-note').text($('#cart-info-note').val() || 'Không có lưu ý');
    $('#cart-pay-price').text($('#cart-total-price').text());
    $('#cart-pay-total').text($('#cart-total-price').text());
}

// Hàm xử lý khi ở bước Complete
function handleCartComplete() {
    $('#btn-cart-back').addClass("d-none");
    $('#cart-footer').addClass("d-none");
    $('#cart-complete-name').text($('#cart-pay-name').text());
    $('#cart-complete-phone').text($('#cart-pay-phone').text());
    $('#cart-complete-address').text($('#cart-pay-address').text());
    $('#cart-complete-note').text($('#cart-pay-note').text());
    $('#cart-complete-total').text($('#cart-pay-total').text());

    const data = {
        addressId: $('input[name="cart-info-address"]:checked').val(),
        totalPrice: $('#cart-complete-total').text().replace(/\./g, '').replace('₫', ''),
        cartItems: cartItems
    };

    $.ajax({
        type: "POST",
        url: "/tai-khoan/order-create",
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        success: function (res) {
            if (res.success)
                showToast(res.message + " Kiểm tra đơn hàng ngay!", 'success');
        },
        error: function (err) {
            console.error(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
}

// Hàm xoá sản phẩm khỏi giỏ hàng
function deleteCartItem(cartId) {
    $.ajax({
        url: "/gio-hang/delete",
        type: "POST",
        data: JSON.stringify({ cartId: cartId }),
        dataType: "json",
        contentType: "application/json",
        success: function (res) {
            if (res.success) {
                Turbo.visit(window.location.href, { frame: 'cart-container', action: 'replace' });
                showToast(res.message, 'success');
                handleCartOrder(200); // Cập nhật tổng tiền sản phẩm
            }
        },
        error: function (err) {
            console.err(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
}