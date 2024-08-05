// Khởi tạo CKEditor
var productContentEditor;
BalloonEditor
    .create(document.querySelector('#ckeditor_balloon'))
    .then(editor => {
        productContentEditor = editor;
    })
    .catch(error => {
        console.error(error);
    });

// Tạo ô edit cho cell
function makeCellEditable($cell) {
    $cell.on('click', function () {
        if ($cell.find('textarea').length === 0) {
            const $textarea = $('<textarea>', {
                text: $cell.text(),
                class: 'editable-textarea form-control'
            }).appendTo($cell.empty()).focus();

            $textarea.on('blur', function () {
                $cell.text($textarea.val());
            }).on('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    $textarea.blur();
                }
            });
        }
    });
}

// Hàm tạo row mới cho bảng
function addEditableRow() {
    const $newRow = $('<tr>').append(
        $('<td>', { class: 'editable', text: '...' }),
        $('<td>', { class: 'editable', text: '...' })
    ).appendTo('#tbl-product-cfg tbody');

    $newRow.find('.editable').each(function () {
        makeCellEditable($(this));
    });
}

// Hàm xoá hết row cho bảng
function deleteAllRows() {
    $('#tbl-product-cfg tbody').empty();
}

// Hàm nhập tệp cấu hình cho bảng
function importProductCfg(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        const [title, description] = line.split(';').map(item => item.trim());
        if (title && description) {
            $('#tbl-product-cfg tbody').append(
                $('<tr>').append(
                    $('<td>', { class: 'editable', text: title }),
                    $('<td>', { class: 'editable', text: description })
                )
            );
            $('#tbl-product-cfg tbody tr:last .editable').each(function () {
                makeCellEditable($(this));
            });
        }
    });
}

function exportProductCfg() {
    const rows = $('#tbl-product-cfg tbody tr');
    let content = '';

    rows.each(function () {
        const cells = $(this).find('td.editable');
        const title = $(cells[0]).text().trim();
        const description = $(cells[1]).text().trim();

        // Kiểm tra nếu cả tiêu đề và mô tả đều không rỗng
        if (title && description) {
            content += `${title}; ${description}\n`;
        }
    });

    return content;
}

// Lặp qua bảng và thêm sự kiện
$('.editable').each(function () {
    makeCellEditable($(this));
});

// Hàm tự chọn thương hiệu và danh mục sản phẩm
function autoSelectCateOrBrand() {
    const productName = $('#product-name').val().toLowerCase();

    if (!productName.trim()) {
        $('#product-category').val('0');
        $('#product-brand').val('0');
        $('#product-brand-series').val('0');
        return;
    }

    let categorySelected = false;
    $('#product-category option').each(function () {
        const categoryText = $(this).text().toLowerCase();
        if (productName.includes(categoryText)) {
            $('#product-category').val($(this).val());
            categorySelected = true;
        }
    });
    if (!categorySelected) $('#product-category').val('0');

    let brandSelected = false;
    $('#product-brand option').each(function () {
        const brandText = $(this).text().toLowerCase();
        if (productName.includes(brandText)) {
            $('#product-brand').val($(this).val());
            brandSelected = true;
        }
    });
    if (!brandSelected) $('#product-brand').val('0');

    let seriesSelected = false;
    const selectedBrandId = $('#product-brand').val();
    $('#product-brand-series option').each(function () {
        const seriesText = $(this).text().toLowerCase();
        const seriesBrandId = $(this).data('brand');
        if (productName.includes(seriesText) && (seriesBrandId === parseInt(selectedBrandId))) {
            $('#product-brand-series').val($(this).val());
            seriesSelected = true;
        }
    });
    if (!seriesSelected) $('#product-brand-series').val('0');

    if (selectedBrandId === "0")
        $('#product-brand-series option').removeClass('d-none');
    else {
        $('#product-brand-series option').each(function () {
            if ($(this).data('brand') === parseInt(selectedBrandId))
                $(this).removeClass('d-none');
            else $(this).addClass('d-none');
        });
    }
}

// Thêm sự kiện cho các nút trên bảng
$('#btn-add-product-cfg').on('click', addEditableRow);
$('#btn-delete-product-cfg').on('click', deleteAllRows);

// Thêm sự kiện cho nút
$('#btn-import-product-cfg').on('change', function (e) {
    deleteAllRows();

    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            importProductCfg(text);
        };
        reader.readAsText(file);

        $(this).val('');
    }
});

// Nhập văn bản cấu hình cho bảng
$('#text_import-product-cfg').on("input", _.debounce(function () {
    deleteAllRows();
    importProductCfg($(this).val());
}, 200));

// Tạo slug cho tên sản phẩm
$('#product-name').on('input', _.debounce(function () {
    autoSelectCateOrBrand();
    $('#product-slug').val(formatToSlugs($(this).val()));
}, 200));

// Xem trước hình ảnh từ file
$('#product-image-file').on('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#product-image-preview').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Đặt thời gian mặt định
$('#product-datetime').val(getDatetimeLocal());

// Lọc ra series phù hợp với brand
$('#product-brand').on('change', function () {
    var selectedBrandId = $(this).val();
    $('#add-brandSeries-form').find("span").text(selectedBrandId);
    if (selectedBrandId === "0")
        $('#product-brand-series option').removeClass('d-none');
    else {
        $('#product-brand-series option').each(function () {
            if ($(this).val() === "0" || $(this).data('brand') === parseInt(selectedBrandId))
                $(this).removeClass('d-none');
            else $(this).addClass('d-none');
        });
    }
});

// Nút thêm loại sản phẩm
$('#add-category-form').find("button").on("click", function () {
    const cateName = $('#add-category-form').find("input").val();

    if (!cateName) { showToast("Vui lòng điền tên danh mục", "danger"); return; }

    $.ajax({
        type: "POST",
        url: "/admin/categories/create",
        data: JSON.stringify({
            CateName: cateName,
        }),
        dataType: "json",
        contentType: "application/json",
        success: (res) => {
            if (res.success) {
                const optionHTML = $('<option>', { value: res.data.insertId, text: cateName, selected: true });
                $('#product-category').append(optionHTML).val(res.data.insertId);
                showToast(res.message, "success");
            }
        },
        error: (err) => {
            console.log(err);
            showToast("Lỗi máy chủ", "danger");
        }
    });
});

// Nút thêm thương hiệu sản phẩm
$('#add-brand-form').find("button").on("click", function () {
    const brandName = $('#add-brand-form').find("input").val();

    if (!brandName) { showToast("Vui này điền đầy đủ thông tin", "danger"); return; }

    $.ajax({
        type: "POST",
        url: "/admin/brands/create",
        data: JSON.stringify({
            BrandName: brandName,
        }),
        dataType: "json",
        contentType: "application/json",
        success: (res) => {
            if (res.success) {
                const optionHTML = $('<option>', { value: res.data.insertId, text: brandName, selected: true });
                $('#product-brand').append(optionHTML).val(res.data.insertId);
                showToast(res.message, "success");
            }
        },
        error: (err) => {
            console.log(err);
            showToast("Lỗi máy chủ", "danger");
        }
    });
});

// Nút thêm Loạt thương hiệu
$('#add-brandSeries-form').find("button").on("click", function () {
    const brandId = $('#product-brand').val();
    const SeriesName = $('#add-brandSeries-form').find("input").val();

    if (!brandId || !SeriesName) { showToast("Vui này điền đầy đủ thông tin", "danger"); return; }

    $.ajax({
        type: "POST",
        url: "/admin/brand-series/create",
        data: JSON.stringify({
            BrandId: brandId,
            SeriesName: SeriesName
        }),
        dataType: "json",
        contentType: "application/json",
        success: (res) => {
            if (res.success) {
                const optionHTML = $('<option>', { value: res.data.insertId, text: SeriesName, selected: true });
                optionHTML.attr('data-brand', brandId);
                $('#product-brand-series').append(optionHTML).val(res.data.insertId);
                showToast(res.message, "success");
            }
        },
        error: (err) => {
            console.log(err);
            showToast("Lỗi máy chủ", "danger");
        }
    });
});

// Sự kiện định dạng tiền tệ
$('#product-price').on('input', function () {
    $(this).val(formatNumToCurrency($(this).val()));
    $('#product-price-text').text(formatNumToCurrencyText($(this).val()));
});

// Nút thêm sản phẩm
$('#btn-product-save').on('click', function () {
    const formData = new FormData();
    formData.append('CateId', $('#product-category').val());
    formData.append('BrandId', $('#product-brand').val());
    formData.append('BrandSeriesId', $('#product-brand-series').val());
    formData.append('Image', $('#product-image-file')[0].files[0]);
    formData.append('ProdName', $('#product-name').val());
    formData.append('Quantity', $('#product-quantity').val());
    formData.append('Price', formatNumber($('#product-price').val()));
    formData.append('Discount', $('#product-discount').val());
    formData.append('Slugs', $('#product-slug').val());
    formData.append('AtCreate', $('#product-datetime').val());
    formData.append('DeviceCfg', exportProductCfg());
    formData.append('Content', productContentEditor.getData());
    formData.append("Tags", $('#product-tags').val());

    $.ajax({
        type: "POST",
        url: "/admin/product/create",
        data: formData,
        processData: false,
        contentType: false,
        dataType: "json",
        success: (res) => {
            console.log(res)
            if (res.success) {
                showToast(res.message, "success");
            }
        },
        error: (err) => {
            console.log(err);
            showToast("Lỗi máy chủ", "danger");
        }
    });
});