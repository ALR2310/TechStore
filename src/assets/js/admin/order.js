function updateOrderStatus(orderId, status) {
  $.ajax({
    url: "order/status",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ id: orderId, status }),
    success: function (res) {
      if (!res.success) return showToast(res.message, "danger");

      showToast(res.message, "success");
      Turbo.visit(window.location.href, {
        frame: "tbl-orders",
        action: "replace",
      });
    },
    error: function (e) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", e);
      showToast(e.responseJSON.message, "danger");
    },
  });
}
