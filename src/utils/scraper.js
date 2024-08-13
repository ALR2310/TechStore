const axios = require('axios');
const cheerio = require('cheerio');

async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url);
        return handleScraper(data);
    } catch (error) {
        console.error('Có lỗi khi lấy HTML:', error);
    }
}

function handleScraper(html) {
    const $ = cheerio.load(html);

    // Biến chứa mô tả sản phẩm
    const descContent = $('.desc-content');

    // Trích dữ liệu từ bảng cấu hình sản phẩm
    let textTableProductCfg = '';
    descContent.children().eq(2).find('tr').each((index, element) => {
        const key = $(element).find('td').eq(0).text().trim();
        const value = $(element).find('td').eq(1).text().trim();
        if (key && value) {
            textTableProductCfg += `${key}; ${value}\n`;
        }
    });

    descContent.children().eq(0).remove(); // Xoá thẻ <p> rỗng
    descContent.children().eq(0).remove(); // Xóa thẻ <p> tiêu đề
    descContent.children().eq(0).remove(); // Xoá bảng cấu hình

    const product = {
        prdName: $('.product-name').text(),
        prdPrice: $('.product-price.has-countdown').find('del').text().replace(/[\.,₫]/g, ''),
        prdDiscount: $('.product-price.has-countdown').find('.pro-percent').text().replace(/[-%]/g, ''),
        prdImg: $('.boxlazy-img--aspect').attr("href"),
        prdContent: descContent.html().trim(),
        prdDeviceCfg: textTableProductCfg.trim()
    };

    return product;
}


module.exports = fetchHTML;