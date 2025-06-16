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
    },

    // Hàm trích xuất thông tin cấu hình cơ bản từ trường cấu hình trong sản phẩm
    extractSimpleDeviceCfg(deviceCfg) {
        const cfgLines = deviceCfg.split('\n').map(line => line.trim());
        const simpleDeviceCfg = {};

        cfgLines.forEach(line => {
            if (line.startsWith('CPU') || line.startsWith('CPU;')) {
                const match = line.match(/Ultra\s+\d+/) || line.match(/i[0-9]-\d+[A-Za-z]/) || line.match(/Ryzen(?:™)?\s[0-9]+/);
                simpleDeviceCfg.CPU = match ? match[0] : 'none';
            } else if (line.startsWith('VGA') || line.startsWith('Card đồ họa')) {
                const match = line.match(/RTX(?:™)? (\d+)/i) || line.match(/AMD Radeon/i) || line.match(/Intel® Arc/i);
                simpleDeviceCfg.VGA = match ? match[0] : 'none';
            } else if (line.startsWith('RAM')) {
                const match = line.match(/[0-9]+GB/);
                simpleDeviceCfg.RAM = match ? match[0] : 'none';
            } else if (line.startsWith('Ổ') || line.startsWith('Ổ cứng')) {
                const match = line.match(/[0-9]+TB/) || line.match(/[0-9]+GB/);
                simpleDeviceCfg.Disk = match ? match[0] : 'none';
            } else if (line.startsWith('Màn hình')) {
                const match = line.match(/(\d+(\.\d+)?[-\s]inch)/i) || line.match(/(\d+(\.\d+)?)"/i);
                simpleDeviceCfg.Display = match ? match[0] : 'none';
                const match1 = line.match(/(\d+Hz)/i);
                simpleDeviceCfg.Refresh = match1 ? match1[0] : 'none';
            }
        });

        return simpleDeviceCfg;
    }
};

module.exports = myUtils;