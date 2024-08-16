const helpers = {
    // So sánh hai giá trị và trả về true nếu chúng bằng nhau
    eq: function (a, b) {
        return a === b;
    },

    // Định dạng một chuỗi số thành tiền tệ Việt Nam (VNĐ)
    formatNumToCurrency: function (value) {
        if (typeof value !== 'string') value = value.toString();
        value = value.replace(/\D/g, '');
        return new Intl.NumberFormat('vi-VN').format(value);
    },

    // So sánh một giá trị với một giá trị khác bằng một toán tử cụ thể (>, <, >=, <=, ==, !=)
    compare: function (value, operator, comparison, options) {
        switch (operator) {
            case '>': return value > comparison ? options.fn(this) : options.inverse(this);
            case '<': return value < comparison ? options.fn(this) : options.inverse(this);
            case '>=': return value >= comparison ? options.fn(this) : options.inverse(this);
            case '<=': return value <= comparison ? options.fn(this) : options.inverse(this);
            case '==': return value == comparison ? options.fn(this) : options.inverse(this);
            case '!=': return value != comparison ? options.fn(this) : options.inverse(this);
            default: return options.inverse(this);
        }
    },

    // Thực hiện phép tính số học giữa hai giá trị (cộng, trừ, nhân, chia)
    calculate: (value1, operator, value2) => {
        value1 = parseFloat(value1);
        value2 = parseFloat(value2);
        switch (operator) {
            case '+': return value1 + value2;
            case '-': return value1 - value2;
            case '*': return value1 * value2;
            case '/': return value1 / value2;
            default: return null;
        }
    },

    // Định dạng một chuỗi thời gian thành định dạng dd/mm/yyyy
    formatDate(datetime) {
        const date = new Date(datetime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
};

module.exports = helpers;