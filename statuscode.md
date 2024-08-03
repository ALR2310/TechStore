# Mã Trạng Thái HTTP Quan Trọng và Cần Thiết cho API

## Các Mã Trạng Thái Thường Dùng
- **200 OK**: Cho các yêu cầu thành công.
- **201 Created**: Khi tạo mới tài nguyên.
- **204 No Content**: Khi xoá tài nguyên.
- **400 Bad Request**: Khi yêu cầu không hợp lệ.
- **401 Unauthorized**: Khi yêu cầu cần xác thực nhưng không được cung cấp.
- **403 Forbidden**: Khi người dùng không có quyền truy cập tài nguyên.
- **404 Not Found**: Khi tài nguyên không tồn tại.
- **409 Conflict**: Khi có xung đột, ví dụ: tài nguyên đã tồn tại.
- **422 Unprocessable Entity**: Khi dữ liệu gửi lên không hợp lệ.
- **500 Internal Server Error**: Khi có lỗi trên máy chủ mà không rõ nguyên nhân.

## Mã Trạng Thái Thành Công (2xx)
- **200 OK**: Thành công cho các phương thức GET, PUT, PATCH, hoặc DELETE.
- **201 Created**: Được tạo thành công, thường sử dụng cho POST khi tạo một resource mới.
- **202 Accepted**: Yêu cầu đã được chấp nhận để xử lý, nhưng xử lý chưa hoàn thành.
- **204 No Content**: Xóa thành công, không có nội dung trả về.

## Mã Trạng Thái Chuyển Hướng (3xx)
- **301 Moved Permanently**: URL của resource đã thay đổi vĩnh viễn. Phản hồi bao gồm URL mới.
- **302 Found**: URL của resource tạm thời thay đổi. Phản hồi bao gồm URL mới.
- **304 Not Modified**: Client có thể sử dụng dữ liệu cache.

## Mã Trạng Thái Lỗi Client (4xx)
- **400 Bad Request**: Yêu cầu không hợp lệ.
- **401 Unauthorized**: Yêu cầu cần có xác thực.
- **403 Forbidden**: Bị từ chối không cho phép truy cập.
- **404 Not Found**: Không tìm thấy resource từ URI.
- **405 Method Not Allowed**: Phương thức không được phép với tài nguyên hiện tại.
- **409 Conflict**: Xung đột trong request, thường do dữ liệu đã tồn tại.
- **410 Gone**: Resource không còn tồn tại, version cũ đã không còn hỗ trợ.
- **415 Unsupported Media Type**: Không hỗ trợ kiểu resource này.
- **422 Unprocessable Entity**: Dữ liệu không được xác thực.
- **429 Too Many Requests**: Yêu cầu bị từ chối do vượt quá giới hạn.

## Mã Trạng Thái Lỗi Server (5xx)
- **500 Internal Server Error**: Lỗi máy chủ chung, không xác định.
- **501 Not Implemented**: Máy chủ không hỗ trợ chức năng yêu cầu.
- **502 Bad Gateway**: Máy chủ nhận được phản hồi không hợp lệ từ máy chủ ngược dòng.
- **503 Service Unavailable**: Máy chủ tạm thời không khả dụng, thường do quá tải hoặc bảo trì.
- **504 Gateway Timeout**: Máy chủ không nhận được phản hồi kịp thời từ máy chủ ngược dòng.


