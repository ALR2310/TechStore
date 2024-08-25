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