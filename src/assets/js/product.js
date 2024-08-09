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
var contentCfg = $('#txt-product-cfg').val();
if (contentCfg) importProductCfg(contentCfg);

// Sự kiện nút xem thêm thông tin
$('#btn-show-more').on('click', function () {
    $(this).closest('.show-more-content').addClass('d-none');
    $('.product-content').removeClass('overflow-hidden').css('height', '100%');
});


// --------------- Các sự kiện lọc sản phẩm --------------------------------------------- 

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

$(`input[name="filter-price"], input[name="filter-cpu"], input[name="filter-ram"], 
    input[name="filter-vga"], input[name="filter-demand"]`).on('change', function () {
    const name = $(this).attr('name').split('-')[1];
    const newUrl = getUrlParams(name, $(this).data('params'));
    Turbo.visit(newUrl, { frame: 'product-container', action: 'replace' });
});

$('button[name="btn-filter-brands"]').on('click', function () {
    const newUrl = getUrlParams('brand', $(this).data('params'));
    Turbo.visit(newUrl, { frame: 'product-container', action: 'replace' });
});