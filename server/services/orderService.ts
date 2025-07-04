import { approveOrderParams, getListOrderParams } from '@shared/types/order.type';
import { getStatisticPayload } from '@shared/types/params.type';
import { isNullOrEmpty } from '@shared/utils/general.utils';
import dayjs from 'dayjs';
import { db } from '~/configs/dbConnect';
import { buildDateFilter } from '~/utils/query.build';

const formatMap = {
  day: '%Y-%m-%d',
  month: '%Y-%m',
  year: '%Y',
};

class OrderService {
  async getListOrder(payload: getListOrderParams) {
    const {
      keyword,
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortDir = 'desc',
      status,
      dateFrom,
      dateTo,
      priceFrom,
      priceTo,
    } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `SELECT 
        O.Id AS Id, O.TotalPrice AS TotalPrice, O.Status AS Status, O.Code AS Code, O.createdAt AS createdAt, O.updatedAt AS updatedAt,
        A.FullName AS FullName, A.PhoneNumber AS PhoneNumber, A.AddressLine AS AddressLine, A.AddressType AS AddressType, A.Country AS Country
      FROM Orders O
      LEFT JOIN Address A ON O.AdrId = A.Id`;

    const conditions: string[] = [];
    const params: any[] = [];

    if (keyword) {
      conditions.push(`(Code LIKE ? OR A.FullName LIKE ? OR A.PhoneNumber LIKE ?)`);
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (status) {
      conditions.push(`(O.Status = ?)`);
      params.push(status);
    }

    if (!isNullOrEmpty(dateFrom) && !isNullOrEmpty(dateTo)) {
      conditions.push(`(O.updatedAt BETWEEN ? AND ?)`);
      params.push(dayjs(dateFrom).startOf('day').toISOString(), dayjs(dateTo).endOf('day').toISOString());
    }

    if (!isNullOrEmpty(priceFrom?.toString()) && !isNullOrEmpty(priceTo?.toString())) {
      conditions.push(`(O.TotalPrice BETWEEN ? AND ?)`);
      params.push(priceFrom, priceTo);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY ${sortBy} ${safeSortDir} LIMIT ? OFFSET ?`;

    const baseCountQuery = `SELECT COUNT(*) AS total FROM Orders O LEFT JOIN Address A ON O.AdrId = A.Id`;

    const countQuery = conditions.length > 0 ? `${baseCountQuery} WHERE ${conditions.join(' AND ')}` : baseCountQuery;

    const [orders, total] = await Promise.all([
      db.query(query, [...params, limit, offset]),
      db.query(countQuery, params),
    ]);

    // Get order items for each order
    for (const order of orders) {
      const orderItemsQuery = `
        SELECT 
          OI.Id AS Id, OI.Quantity AS Quantity, OI.createdAt AS createdAt, OI.updatedAt AS updatedAt,
          P.Id AS ProdId, P.ProdName as ProdName, P.Price AS Price, P.Image AS Image, P.Slugs AS Slugs, P.Status AS Status,
          C.CateName AS Category,
          B.BrandName AS Brand,
          BS.SeriesName AS Series
        FROM OrderItems OI
        LEFT JOIN Product P ON OI.ProdId = P.Id
        LEFT JOIN Categories C ON P.CateId = C.Id
        LEFT JOIN Brands B ON P.BrandId = B.Id
        LEFT JOIN BrandSeries BS ON P.BrandSeriesId = BS.Id
        WHERE OI.OrdId = ?`;
      const orderItems = await db.query(orderItemsQuery, [order.Id]);
      order.Items = orderItems;
    }

    return {
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total[0].total),
        totalPages: Math.ceil(Number(total[0].total) / Number(limit)),
      },
    };
  }

  async getOrderByUser(userId: string) {
    const query = `
            SELECT Id, AdrId, Code, TotalPrice, Status, createdAt, updatedAt
            FROM Orders WHERE UserId = ?`;
    const orders = await db.query(query, [userId]);

    for (const order of orders) {
      const addressQuery = `SELECT * FROM Address WHERE ID = ?`;
      const address = await db.query(addressQuery, [order.AdrId]);
      order.Address = address[0] || null;

      const orderItemsQuery = `SELECT * FROM OrderItems WHERE OrdId = ?`;
      const orderItems = await db.query(orderItemsQuery, [order.Id]);
      order.Items = orderItems;
    }

    return orders;
  }

  async approveOrder(payload: approveOrderParams) {
    const { id, status } = payload;

    const orderExists = await db.query(`SELECT * FROM Orders WHERE Id = ?`, [id]);
    if (orderExists.length === 0) {
      throw new Error('Order not found');
    }

    if (!['Processing', 'Delivering', 'Completed', 'Cancelled'].includes(status)) {
      throw new Error('Invalid status');
    }

    const query = `UPDATE Orders SET Status = ?, updatedAt = ? WHERE Id = ?`;
    await db.query(query, [status, dayjs().toISOString(), id]);

    return { message: 'Order status updated successfully.' };
  }

  async deleteOrderOfUser(userId: string) {
    const exists = await this.getOrderByUser(userId);
    if (exists.length === 0) {
      return { message: 'No orders found for this user.' };
    }

    await db.query(`DELETE FROM OrderItems WHERE OrdId IN (SELECT Id FROM Orders WHERE UserId = ?)`, [userId]);
    await db.query(`DELETE FROM Orders WHERE UserId = ?`, [userId]);

    return { message: 'Orders deleted successfully.' };
  }

  async deleteOrderOfProduct(productId: string) {
    const exists = await db.query(`SELECT * FROM OrderItems WHERE ProdId = ?`, [productId]);
    if (exists.length === 0) {
      return { message: 'No orders found for this product.' };
    }

    await db.query(`DELETE FROM OrderItems WHERE ProdId = ?`, [productId]);
    return { message: 'Order items deleted successfully.' };
  }

  async getStatistic(payload: getStatisticPayload) {
    const { by = 'day', startDate, endDate } = payload;

    const dateQuery = buildDateFilter(startDate, endDate);

    const orderCountQuery = `
      SELECT 
        strftime('${formatMap[by]}', createdAt) as label,
        COUNT(*) as count
      FROM Orders
      ${dateQuery.query}
      GROUP BY label
      ORDER BY label ASC;
    `;

    const orderRevenueQuery = `
      SELECT 
        strftime('${formatMap[by]}', createdAt) as label,
        SUM(TotalPrice) as revenue
      FROM Orders
      ${dateQuery.query}
      GROUP BY label
      ORDER BY label ASC;
    `;

    const orderByStatusQuery = `
      SELECT 
        Status,
        COUNT(*) as count
      FROM Orders
      ${dateQuery.query}
      GROUP BY Status;
    `;

    const [orderCount, orderRevenue, totalOrder, orderByStatus] = await Promise.all([
      db.query(orderCountQuery, dateQuery.params),
      db.query(orderRevenueQuery, dateQuery.params),
      db.query(`SELECT COUNT(*) as total FROM Orders`),
      db.query(orderByStatusQuery, dateQuery.params),
    ]);

    return {
      totalOrder: totalOrder[0]?.total || 0,
      orderByStatus: orderByStatus.reduce((acc: Record<string, number>, row: any) => {
        acc[row.Status] = Number(row.count);
        return acc;
      }, {}),
      orderCount: orderCount.map((r: any) => ({ label: r.label, count: Number(r.count) })),
      orderRevenue: orderRevenue.map((r: any) => ({ label: r.label, revenue: Number(r.revenue ?? 0) })),
    };
  }
}

export const orderService = new OrderService();
