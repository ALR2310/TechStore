function deleteUser(userId) {
  if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
    $.ajax({
      url: "user",
      type: "DELETE",
      contentType: "application/json",
      data: JSON.stringify({ id: userId }),
      success: function (res) {
        if (!res.success) return showToast(res.message, "danger");

        showToast(res.message, "success");
        Turbo.visit(window.location.href, {
          frame: "tbl-users",
          action: "replace",
        });
      },
      error: function (e) {
        console.error("Lỗi xoá người dùng:", e);
        showToast(e.responseJSON.message, "danger");
      },
    });
  }
}

function editUser(userId) {
  $(`#row-${userId} .view-mode`).hide();
  $(`#row-${userId} .edit-mode`).show();
  $(`#row-${userId} .edit-btn, #row-${userId} .delete-btn`).hide();
  $(`#row-${userId} .save-btn, #row-${userId} .cancel-btn`).show();
}

function cancelEdit(userId) {
  $(`#row-${userId} .view-mode`).show();
  $(`#row-${userId} .edit-mode`).hide();
  $(`#row-${userId} .edit-btn, #row-${userId} .delete-btn`).show();
  $(`#row-${userId} .save-btn, #row-${userId} .cancel-btn`).hide();
}

function saveUser(userId) {
  const data = {
    id: userId,
    fullName: $(`#row-${userId} input:eq(0)`).val(),
    phoneNumber: $(`#row-${userId} input:eq(1)`).val(),
    email: $(`#row-${userId} input:eq(2)`).val(),
    gender: $(`#row-${userId} select:eq(0)`).val(),
    dateOfBirth: $(`#row-${userId} input:eq(3)`).val(),
    role: $(`#row-${userId} select:eq(1)`).val(),
    status: $(`#row-${userId} select:eq(2)`).val(),
  };

  $.ajax({
    url: "user",
    type: "PATCH",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (res) {
      if (!res.success) return showToast(res.message, "danger");

      showToast(res.message, "success");
      Turbo.visit(window.location.href, {
        frame: "tbl-users",
        action: "replace",
      });
    },
    error: function (err) {
      console.error("Lỗi cập nhật người dùng:", err);
      showToast("Có lỗi xảy ra, vui lòng thử lại sau", "danger");
    },
  });
}
