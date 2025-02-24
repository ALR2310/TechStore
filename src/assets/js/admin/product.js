$("#txt_product_search").on(
  "input",
  _.debounce(function () {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("q", this.value);

    Turbo.visit(url, { action: "replace", frame: "frame-product-list" });
  }, 500)
);

$("#btn_product_search").on("click", function () {
  $("#txt_product_search").trigger("input");
});

function deleteProduct(id) {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
    $.ajax({
      url: "/admin/product/delete",
      type: "DELETE",
      contentType: "application/json",
      data: JSON.stringify({ id: id }),
      success: function (res) {
        if (!res.success) return showToast(res.message, "danger");
        showToast(res.message, "success");

        Turbo.visit(window.location.href, {
          action: "replace",
          frame: "frame-product-list",
        });
      },
    });
  }
}
