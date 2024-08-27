// Sự kiện đặt class cho profile menu
$(document).ready(function () {
    $('.profile-menu-left').on('click', function (event) {
        const href = $(this).attr('href');
        event.preventDefault();

        if (href !== '/auth/logout') {
            var target = $(this).attr('href');

            $('.tab-pane').removeClass('show active');
            $(target).addClass('show active');

            $('.profile-menu-left').removeClass('active');
            $(this).addClass('active');

            if (history.pushState) history.pushState(null, null, target);
            else location.hash = target;
        } else {
            window.location.href = href;
        }
    });

    var hash = window.location.hash || '#ho-so';
    $('.profile-menu-left[href="' + hash + '"]').trigger('click');
});


// --------------- Trang Profile -------------------------------

// Nút lưu thông tin người dùng
$('#btn-profile-save').on('click', function () {
    const data = {
        fullName: $('#profile-fullName').val(),
        gender: $('input[name="profile-gender"]:checked').val(),
        phoneNumber: $('#profile-phoneNumber').val(),
        email: $("#profile-email").val(),
        dateOfBirth: $('#profile-dateOfBirth').val()
    };

    $.ajax({
        type: "POST",
        url: "/tai-khoan/profile-update",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        success: function (res) {
            if (res.success)
                showToast(res.message, 'success');
        },
        error: function (err) {
            console.error(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
});

// ----------------- Trang Address ----------------------------

// Lấy thông tin về tỉnh thành cho thẻ select
$.get('https://provinces.open-api.vn/api/p/', function (data) {
    let $provinceSelect = $('#address-province');
    $.each(data, function (index, province) {
        $provinceSelect.append($('<option>', {
            value: province.code,
            text: province.name
        }));
    });
});

// Lấy thông tin về quận huyện khi chọn tỉnh thành cho thẻ select
$('#address-province').change(function () {
    let provinceCode = $(this).val();
    $.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`, function (data) {
        let $districtSelect = $('#address-district');
        $districtSelect.empty().append($('<option>', {
            selected: true,
            text: 'Chọn Quận/Huyện'
        }));
        $.each(data.districts, function (index, district) {
            $districtSelect.append($('<option>', {
                value: district.code,
                text: district.name
            }));
        });
    });
});

// Lấy thông tin về phường xã khi chọn quận huyện cho thẻ select
$('#address-district').change(function () {
    let districtCode = $(this).val();
    $.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`, function (data) {
        let $wardSelect = $('#address-ward');
        $wardSelect.empty().append($('<option>', {
            selected: true,
            text: 'Chọn Phường/Xã'
        }));
        $.each(data.wards, function (index, ward) {
            $wardSelect.append($('<option>', {
                value: ward.code,
                text: ward.name
            }));
        });
    });
});

// Nút lưu địa chỉ 
$('#btn-address-save').on('click', function () {
    $(this).addClass("disabled");
    const addressLine = $('#address-province option:selected').text() + ', ' + $('#address-district option:selected').text()
        + ', ' + $('#address-ward option:selected').text() + `, ${($('#address-street').val() || '')}`;

    const data = {
        fullName: $('#address-fullName').val(),
        phoneNumber: $('#address-phoneNumber').val(),
        AddressLine: addressLine,
        AddressType: $('input[name="address-type"]:checked').val()
    };

    $.ajax({
        type: "POST",
        url: "/tai-khoan/address-create",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        success: function (res) {
            if (res.success) {
                $('#btn-address-save').removeClass("disabled");
                showToast(res.message, 'success');
                $('#modal-address').modal('hide');
                Turbo.visit(window.location.href, { frame: 'address-container', action: 'replace' });
            }
        },
        error: function (err) {
            $('#btn-address-save').removeClass("disabled");
            console.error(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
});

// Hàm đặt địa chỉ mặt định
function setDefaultAddress(Id) {
    if (!Id) return;

    $.ajax({
        type: "POST",
        url: "/tai-khoan/address-default",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json",
        success: function (res) {
            if (res.success) {
                showToast(res.message, 'success');
                $('#modal-address').modal('hide');
                Turbo.visit(window.location.href, { frame: 'address-container', action: 'replace' });
            }
        },
        error: function (err) {
            console.error(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
}

// Hàm xoá địa chỉ
function deleteAddress(Id) {
    if (!Id) return;

    $.ajax({
        type: "POST",
        url: "/tai-khoan/address-delete",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json",
        success: function (res) {
            if (res.success) {
                showToast(res.message, 'success');
                $('#modal-address').modal('hide');
                Turbo.visit(window.location.href, { frame: 'address-container', action: 'replace' });
            }
        },
        error: function (err) {
            console.error(err);
            showToast(err.responseJSON.message, 'danger');
        }
    });
}



// --------------------------Trang orders ------------------------------------

// Chức năng hiển thị giao diện cho trang orders
$('.order-tabs').on('click', function (e) {
    e.preventDefault();

    $('.order-tabs').removeClass('active');
    $(this).addClass('active');

    const url = $(this).attr('href');
    Turbo.visit(url, { frame: 'order-container', action: 'replace' });

    document.addEventListener('turbo:frame-load', function () {
        window.history.replaceState(null, null, '#don-hang');
    }, { once: true });
});

// Sự kiện tìm kiếm sản phẩm
$('#order-search').on('input', _.debounce(function () {
    const url = window.location.origin + window.location.pathname + '?q=' + encodeURIComponent($(this).val());

    Turbo.visit(url, { frame: 'order-container', action: 'replace' });
}, 500));

// Nút tìm kiếm sản phẩm
$('#btn-order-search').on('click', function () {
    $('#order-search').trigger('input');
});
