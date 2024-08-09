const helpers = {
    eq: function (a, b) {
        return a === b;
    },

    formatNumToCurrency: function (value) {
        value = value.replace(/\D/g, '');
        return new Intl.NumberFormat('vi-VN').format(value);
    },

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
    }
};

module.exports = helpers;