const helpers = {
    eq: function (a, b) {
        return a === b;
    },

    formatNumToCurrency: function (value) {
        value = value.replace(/\D/g, '');
        return new Intl.NumberFormat('vi-VN').format(value);
    }
};

module.exports = helpers;