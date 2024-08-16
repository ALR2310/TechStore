const myUtils = {
    formatToSlugs: (str) => {
        str = str.trim().toLowerCase(); // Chuyển đổi thành chữ thường
        // Đổi ký tự có dấu thành không dấu
        str = str.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
        str = str.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
        str = str.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
        str = str.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
        str = str.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
        str = str.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
        str = str.replace(/đ/gi, 'd');
        // Xóa các ký tự đặc biệt
        str = str.replace(/[`~!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/g, '');
        // Đổi khoảng trắng thành ký tự gạch ngang
        str = str.replace(/ +/g, '-');
        // Đổi nhiều ký tự gạch ngang liên tiếp thành một ký tự gạch ngang
        str = str.replace(/-{2,}/g, '-');
        return str;
    }
};

module.exports = myUtils;