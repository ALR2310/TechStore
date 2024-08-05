// Khởi tạo CKEditor
var notedEditor;
BalloonEditor
    .create(document.querySelector('#ckeditor_balloon'))
    .then(editor => {
        notedEditor = editor;
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

// Lặp qua bảng và thêm sự kiện
$('.editable').each(function () {
    makeCellEditable($(this));
});

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

