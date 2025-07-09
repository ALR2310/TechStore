import chalk from 'chalk';
import { db } from '../../server/configs/dbConnect';
import { hash } from 'bcryptjs';
import { faker } from '@faker-js/faker';

const reviewSamples = {
  1: [
    'Tệ quá',
    'Hỏng ngay khi nhận',
    'Không như mô tả',
    'Rất thất vọng',
    'Chất lượng kém, không đáng mua',
    'Giao hàng chậm, sản phẩm lỗi',
    'Mua về dùng được 1 ngày là hỏng',
    'Hàng giả, không đúng như quảng cáo',
    'Dịch vụ chăm sóc khách hàng quá tệ',
    'Tiền mất tật mang, không nên mua',
    '',
    '',
    '',
  ],
  2: [
    'Chưa hài lòng',
    'Sản phẩm không tốt',
    'Khá tệ',
    'Có thể tốt hơn',
    'Dùng tạm được nhưng không bền',
    'Giá cao so với chất lượng',
    'Hàng không đúng kích thước, khó dùng',
    'Màu sắc khác xa hình ảnh quảng cáo',
    'Giao hàng lâu, đóng gói cẩu thả',
    'Cần cải thiện nhiều về chất lượng',
    '',
    '',
    '',
  ],
  3: [
    'Tạm ổn',
    'Bình thường',
    'Không đặc biệt',
    'Chấp nhận được',
    'Cũng được nhưng không ấn tượng',
    'Hàng ổn nhưng cần cải thiện',
    'Dùng được nhưng không bền lắm',
    'Giá cả hợp lý, nhưng chất lượng trung bình',
    'Hàng đúng mô tả nhưng không nổi bật',
    'Dịch vụ ổn nhưng giao hàng hơi chậm',
    '',
    '',
    '',
  ],
  4: [
    'Khá tốt',
    'Sẽ mua lại',
    'Đáng tiền',
    'Ổn áp',
    'Hài lòng, nhưng giao hàng hơi lâu',
    'Chất lượng tốt, đúng như kỳ vọng',
    'Sản phẩm tốt, phù hợp với giá',
    'Dịch vụ hỗ trợ nhiệt tình, đáng khen',
    'Hàng đẹp, nhưng bao bì hơi kém',
    'Rất ổn, sẽ giới thiệu cho bạn bè',
    '',
    '',
    '',
  ],
  5: [
    'Rất tuyệt!',
    'Xuất sắc',
    'Vượt mong đợi',
    'Quá hài lòng',
    'Sản phẩm tuyệt vời, dịch vụ tốt',
    'Đỉnh cao, rất đáng để mua',
    'Chất lượng hoàn hảo, không chê được',
    'Giao hàng nhanh, đóng gói cẩn thận',
    'Sản phẩm đẹp, đúng như quảng cáo',
    'Dịch vụ khách hàng tuyệt vời, 5 sao',
    '',
    '',
    '',
  ],
};

const GENDERS = ['Nam', 'Nữ'];
const ADDRESS_TYPES = ['Nhà riêng', 'Văn phòng'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => 0.5 - Math.random());
}

function getRandomPastDate(): string {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000));
  return pastDate.toISOString().slice(0, 19).replace('T', ' ');
}

export async function fakeReviews() {
  const users = await db.query(
    `SELECT U.Id, UI.FullName FROM User U LEFT JOIN UserInfo UI ON U.Id = UI.UserId WHERE U.Status = 'Active'`,
  );
  const products = await db.query('SELECT Id, ProdName FROM Product ORDER BY RANDOM() LIMIT 50');

  for (const product of products) {
    console.log(chalk.blue(`📦 Đang thêm đánh giá cho: ${product.ProdName}`));

    // Pick random 3-6 user
    const reviewers: any = shuffle(users).slice(0, Math.floor(Math.random() * 4) + 3);

    for (const user of reviewers) {
      const rating = Math.floor(Math.random() * 5) + 1; // 1 to 5
      const comment = randomFrom(reviewSamples[rating]);
      const createdAt = getRandomPastDate();

      const existing = await db.query(`SELECT 1 FROM ProductReviews WHERE ProdId = ? AND UserId = ?`, [
        product.Id,
        user.Id,
      ]);
      if (existing.length > 0) {
        console.log(chalk.yellow(`Đánh giá của người dùng ${user.FullName} đã tồn tại(skip)}`));
        continue;
      }

      await db.query(
        `INSERT INTO ProductReviews (ProdId, UserId, UserName, Rating, Comment, Status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 'Active', ?, ?)`,
        [product.Id, user.Id, user.FullName, rating, comment, createdAt, createdAt],
      );
      console.log(chalk.green(`Đã thêm đánh giá của người dùng ${user.FullName}`));
    }
  }
  console.log(chalk.green('✅ Dữ liệu đánh giá đã được tạo.'));
}

export async function fakeViewed() {
  const users = await db.query(
    `SELECT U.Id, UI.FullName FROM User U LEFT JOIN UserInfo UI ON U.Id = UI.UserId WHERE U.Status = 'Active'`,
  );
  const products = await db.query('SELECT Id, ProdName FROM Product ORDER BY RANDOM() LIMIT 50');

  for (const product of products) {
    console.log(chalk.blue(`📦 Đang thêm lượt xem cho: ${product.ProdName}`));
    const viewers: any = shuffle(users).slice(0, Math.floor(Math.random() * 16) + 5);

    for (const user of viewers) {
      const createdAt = getRandomPastDate();

      const existing = await db.query(`SELECT 1 FROM ProductViewed WHERE ProdId = ? AND UserId = ?`, [
        product.Id,
        user.Id,
      ]);
      if (existing.length > 0) {
        console.log(chalk.yellow(`Lượt xem của người dùng ${user.FullName} đã tồn tại(skip)}`));
        continue;
      }

      await db.query(
        `INSERT INTO ProductViewed (ProdId, UserId, Status, createdAt, updatedAt)
         VALUES (?, ?, 'Active', ?, ?)`,
        [product.Id, user.Id, createdAt, createdAt],
      );
    }
  }

  console.log(chalk.green('✅ Dữ liệu lượt xem đã được tạo.'));
}

export async function fakeUsers(count = 5) {
  for (let i = 0; i < count; i++) {
    const fullName = faker.person.fullName();
    const email = faker.internet.email().toLowerCase();
    const userName = faker.internet.username().toLowerCase();
    const password = await hash('123456', 10);
    const gender = randomFrom(GENDERS);
    const dob = faker.date
      .past({ years: 30, refDate: new Date('2005-01-01') })
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const createdAt = getRandomPastDate();

    // Insert User
    const result = await db.query(
      `INSERT INTO User (Email, UserName, Password, Role, Status, createdAt, updatedAt)
       VALUES (?, ?, ?, 'User', 'Active', ?, ?) RETURNING Id`,
      [email, userName, password, createdAt, createdAt],
    );
    const userId = result.insertId;

    // Insert UserInfo
    await db.query(
      `INSERT INTO UserInfo (UserId, FullName, Gender, DoB, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, fullName, gender, dob, createdAt, createdAt],
    );

    const addressType = randomFrom(ADDRESS_TYPES);
    const addressLine = faker.location.streetAddress({ useFullAddress: true });
    const phoneNumber = faker.phone.number().replace('-', '');
    const isDefault = 1;

    await db.query(
      `INSERT INTO Address (UserId, FullName, PhoneNumber, AddressLine, AddressType, IsDefault, Status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, ?)`,
      [userId, fullName, phoneNumber, addressLine, addressType, isDefault, createdAt, createdAt],
    );
  }

  console.log(chalk.green(`👤 Đã tạo ${count} user.`));
}
