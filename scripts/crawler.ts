import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { getProxy } from '../shared/utils/proxy.utils';
import { getAxiosWithProxy } from '../shared/utils/axios.utils';
import chalk from 'chalk';
import { db } from '../server/configs/dbConnect';
import dayjs from 'dayjs';
import { formatToSlug, stringifySpecs } from '../shared/utils/general.utils';
import path from 'path';
import * as fs from 'fs';

type Product = {
  body_html: string;
  created_at: string;
  handle: string;
  id: number;
  product_type: string;
  published_at: string;
  published_scope: string;
  template_suffix: string | null;
  title: string;
  updated_at: string;
  vendor: string;
  not_allow_promotion: boolean;
  available: boolean;
  tags: string;
  sole_quantity: number;
  image: {
    created_at: string | null;
    id: number;
    position: number;
    product_id: number;
    updated_at: string | null;
    src: string;
    alt: string | null;
    variant_ids: any[] | null;
  };
  variants: {
    barcode: string;
    compare_at_price: string;
    fulfillment_service: string;
    grams: number;
    id: number;
    inventory_management: string;
    inventory_policy: string;
    option1: string;
    option2: string;
    option3: string;
    position: number;
    price: string;
    product_id: number;
    requires_shipping: boolean;
    sku: string;
    taxable: boolean;
    title: string;
    updated_at: string | null;
    inventory_quantity: number;
    old_inventory_quantity: number;
    image_id: number | null;
    weight: number;
    available: boolean;
    weight_unit: string;
  }[];
};

function extractDescription(html: string): string {
  const $ = cheerio.load(html);

  const firstTable = $('table').first();
  if (!firstTable.length) return '';

  let current: any = firstTable[0].nextSibling;

  const collected: string[] = [];
  while (current) {
    collected.push($.html(current));
    current = current.nextSibling;
  }

  return collected.join('\n').trim();
}

function extractSpecs(html: string): [string, string][] {
  const $ = cheerio.load(html);

  const specs: [string, string][] = [];

  const rows = $('table tr');
  rows.each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length !== 2) return;

    const key = $(cells[0]).text().trim().replace(/\s+/g, ' ');
    const value = $(cells[1]).text().trim().replace(/\s+/g, ' ');

    if (key && value) {
      specs.push([key, value]);
    }
  });

  return specs;
}

async function retryRequest<T>(
  axiosInstances: (() => Promise<AxiosInstance>)[],
  url: string,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const getInstance of axiosInstances) {
      try {
        const instance = await getInstance();
        const response = await instance.get(url);
        if (response.status === 200) return response.data;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 429 || err.code === 'ECONNREFUSED') {
          const delay = initialDelay * attempt;
          console.log(chalk.yellow(`[${status}] Retry sau ${delay}ms`));
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
      }
    }
  }
  throw new Error(`Thất bại khi gọi API sau ${maxRetries} lần`);
}

async function downloadImage(url: string, fileName: string): Promise<string | null> {
  try {
    const dir = path.resolve(path.join(__dirname, '..', 'server', 'assets', 'uploads'));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const urlExt = path.extname(new URL(url).pathname);
    const fileNameWithExt = path.extname(fileName) ? fileName : fileName + urlExt;

    const filePath = path.join(dir, fileNameWithExt);
    const response = await axios.get(url, { responseType: 'stream' });

    await new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return path.join('uploads', fileNameWithExt);
  } catch (err: any) {
    console.error(`Tải ảnh thất bại từ ${url}:`, err.message || err);
    return null;
  }
}

async function handleGetCategoryId(categoryName: string) {
  switch (categoryName.toLowerCase()) {
    case 'Laptop Phổ Thông':
      return 1;
    case 'Laptop Gaming':
      return 2;
    case 'Thiết bị PC':
      return 3;
  }

  const category = await db.query('SELECT Id FROM Categories WHERE CateName = ?', [categoryName]);
  if (category.length > 0) return category[0].Id as number;

  const result = await db.query('INSERT INTO Categories (CateName, Slugs) VALUES (?, ?)', [
    categoryName,
    formatToSlug(categoryName),
  ]);
  return result.insertId as number;
}

async function handleGetBrandId(brandName: string) {
  const brand = await db.query(`SELECT Id FROM Brands WHERE BrandName = ? COLLATE NOCASE`, [brandName]);
  if (brand.length > 0) return brand[0].Id as number;
  return null;
}

async function handleInsertProduct(productInfo: Product) {
  // Check exist
  const product = await db.query(`SELECT 1 FROM Product WHERE ProdName = ? AND Slugs = ?`, [
    productInfo.title,
    productInfo.handle,
  ]);
  if (product.length > 0) {
    console.log(chalk.bgCyan(`Sản phẩm: ${productInfo.title} đã tồn tại(skip)`));
    return;
  }

  const desc = extractDescription(productInfo.body_html);
  const specs = extractSpecs(productInfo.body_html);

  // If no description or specs, skip
  if (specs.length === 0) {
    console.log(chalk.yellow(`Sản phẩm: ${productInfo.handle} không có cấu hình (skip)`));
    return;
  }

  const categoryId = await handleGetCategoryId(productInfo.product_type);
  const brandId = await handleGetBrandId(productInfo.vendor);
  const quantity = Math.floor(Math.random() * 100) + 1;
  const discount = Math.floor(Math.random() * 15) + 1;
  const image = await downloadImage(productInfo.image.src, productInfo.handle);

  // Insert Product
  const dateNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const query = `
    INSERT INTO Product (CateId, BrandId, Image, ProdName, quantity, Price, Discount, Slugs, Status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    categoryId,
    brandId,
    image,
    productInfo.title,
    quantity,
    productInfo.variants[0].price,
    discount,
    productInfo.handle,
    'Active',
    dateNow,
    dateNow,
  ];

  try {
    const result = await db.query(query, params);
    await db.query(
      `
      INSERT INTO ProductDetails (ProdId, DeviceCfg, Content, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)`,
      [result.insertId, stringifySpecs(specs), desc, dateNow, dateNow],
    );
    console.log(chalk.green(`Thêm sản phẩm: ${productInfo.title} hoàn thành`));
  } catch (e: any) {
    console.log(chalk.red('Lỗi khi thêm sản phẩm:' + productInfo.title + '(skip)'));
  }
}

// @ts-ignore
async function handleCrawler() {
  let page = 1;
  const collections = [
    // 'man-hinh-do-hoa',
    // 'man-hinh-cong',
    // 'tan-nhiet-may-tinh',
    // 'psu-nguon-may-tinh',
    // 'case-thung-may-tinh',
    // 'cpu-bo-vi-xu-ly',
    // 'mainboard-bo-mach-chu',
    // 'radeon-rx',
    // 'nvidia-quadro',
    // 'vga-rtx-50-series',
    // 'pc-gvn',
    // 'pc-gvn-i3',
    // 'pc-gvn-i5',
    // 'pc-gvn-i7',
    // 'pc-gvn-i9',
    // 'laptop-asus-hoc-tap-va-lam-viec',
    // 'laptop-acer-hoc-tap-va-lam-viec',
    // 'laptop-msi-hoc-tap-va-lam-viec',
    // 'laptop-lenovo-hoc-tap-va-lam-viec',
    // 'laptop-dell-hoc-tap-va-lam-viec',
    // 'laptop-hp-pavilion',
    // 'laptop-lg-gram',
    // 'laptop-gaming-asus',
    // 'laptop-gaming-acer',
    // 'laptop-msi-gaming',
    // 'laptop-gaming-lenovo',
    // 'laptop-gaming-dell',
    // 'laptop-gaming-hp',
  ];
  let hashMore = true;
  let proxyIndex = 0;

  const proxies = await getProxy();
  const useProxy = proxies.length > 0;

  while (hashMore) {
    for (const collection of collections) {
      // Get random proxy
      const proxyUrl = useProxy ? proxies[proxyIndex % proxies.length] : undefined;
      proxyIndex++;

      // Delay random from 2,1s to 0,1s
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 100));

      // Get axios with proxy
      const axiosInstance = proxyUrl ? getAxiosWithProxy(proxyUrl) : axios;

      // Get list product
      const productsUrl = `https://gearvn.com/collections/${collection}/products.json?include=metafields[product]&page=${page}&limit=50`;
      const response: any = await retryRequest([async () => axiosInstance, async () => axios], productsUrl);
      if (!response) {
        console.log(chalk.red('Lỗi khi lấy danh sách sản phẩm'));
        continue;
      }

      const products = response.products as Product[];

      if (products.length === 0) {
        hashMore = false;
        console.log(chalk.bgGreenBright(`Đã lấy xong cho collection: ${collection}`));
        break;
      }

      for (const product of products) {
        if (product.variants[0].price) {
          await handleInsertProduct(product);
        }
      }

      console.log(chalk.bgGreenBright(`Đã lấy xong cho collection: ${collection}`));
    }

    console.log(chalk.bgGreenBright(`Đã lấy xong cho trang ${page}`));
    // page++;
    break;
  }
}

// @ts-ignore
async function deleteProducts() {
  const products = await db.query(`SELECT Id FROM Product WHERE Image LIKE 'https%'`);
  const ids = products.map((p: any) => p.Id);

  const placeholders = ids.map(() => '?').join(',');
  await db.query(`DELETE FROM Product WHERE Id IN (${placeholders})`, ids);
  await db.query(`DELETE FROM ProductDetails WHERE ProdId IN (${placeholders})`, ids);
}

// @ts-ignore
async function removeUnusedImages() {
  const UPLOAD_DIR = path.join(__dirname, '../server/assets/uploads');

  const allFiles = fs.readdirSync(UPLOAD_DIR);

  const rows = await db.query(`SELECT Image FROM Product WHERE Image IS NOT NULL`);
  const usedImages = new Set(rows.map((row) => path.basename(row.Image)));

  for (const file of allFiles) {
    if (!usedImages.has(file)) {
      const fullPath = path.join(UPLOAD_DIR, file);
      fs.unlinkSync(fullPath);
      console.log(`Đã xoá ảnh không dùng: ${file}`);
    }
  }
}

(async () => {
  try {
    await handleCrawler();
  } catch (e: any) {
    console.log(e.message);
  }
})();
