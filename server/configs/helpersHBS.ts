const helpers = {
  // So sánh hai giá trị và trả về true nếu chúng bằng nhau
  eq: function (a: any, b: any) {
    return a === b;
  },

  // Định dạng một chuỗi số thành tiền tệ Việt Nam (VNĐ)
  formatNumToCurrency: function (value: any) {
    if (typeof value !== 'string') value = value.toString();
    value = value.replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(value);
  },

  // So sánh một giá trị với một giá trị khác bằng một toán tử cụ thể (>, <, >=, <=, ==, !=)
  compare: function (value: any, operator: string, comparison: any, options: any) {
    switch (operator) {
      case '>':
        return value > comparison ? options.fn(this) : options.inverse(this);
      case '<':
        return value < comparison ? options.fn(this) : options.inverse(this);
      case '>=':
        return value >= comparison ? options.fn(this) : options.inverse(this);
      case '<=':
        return value <= comparison ? options.fn(this) : options.inverse(this);
      case '==':
        return value == comparison ? options.fn(this) : options.inverse(this);
      case '!=':
        return value != comparison ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  },

  // Thực hiện phép tính số học giữa hai giá trị (cộng, trừ, nhân, chia)
  calculate: (value1: any, operator: string, value2: any) => {
    value1 = parseFloat(value1);
    value2 = parseFloat(value2);
    switch (operator) {
      case '+':
        return value1 + value2;
      case '-':
        return value1 - value2;
      case '*':
        return value1 * value2;
      case '/':
        return value1 / value2;
      default:
        return null;
    }
  },

  // Định dạng một chuỗi thời gian thành định dạng dd/mm/yyyy
  formatDate(datetimeStr: string, type: number) {
    if (type == 1) {
      const date = new Date(datetimeStr);
      const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const day = dayNames[date.getDay()];

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const dayOfMonth = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${hours}:${minutes} ${day} - ${dayOfMonth}/${month}/${year}`;
    } else if (type == 2) {
      const date = new Date(datetimeStr);
      return date.toISOString().slice(0, 16);
    }

    const date = new Date(datetimeStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  },

  json(data: any) {
    return JSON.stringify(data);
  },

  // Kiểm tra url hình ảnh
  safeUrl(url: string) {
    if (typeof url !== 'string') return url;
    const isUrl = /^(https?:\/\/|ftp:\/\/|mailto:)/i.test(url);
    if (isUrl) return url;
    if (url.startsWith('/')) return url;
    return '/' + url;
  },
};

export default helpers;
