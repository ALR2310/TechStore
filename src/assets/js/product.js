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
const contentCfg = $('#txt-product-cfg').val();
if (contentCfg) importProductCfg(contentCfg);

// Sự kiện nút xem thêm thông tin
$('#btn-show-more').on('click', function () {
    $(this).closest('.show-more-content').addClass('d-none');
    $('.product-content').removeClass('overflow-hidden').css('height', '100%');
});