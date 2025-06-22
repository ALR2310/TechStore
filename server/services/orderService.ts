import { db } from '~/configs/dbConnect';

class OrderService {
  async getOrderByUser(userId: string) {
    const query = `
            SELECT Id, AdrId, Code, TotalPrice, Status, createdAt, updatedAt
            FROM Orders WHERE UserId = ?`;
    const orders = await db.query(query, [userId]);

    for (const order of orders) {
      const addressQuery = `SELECT * FROM Address WHERE ID = ?`;
      const address = await db.query(addressQuery, [order.AdrId]);
      order.Address = address[0] || null;

      const orderItemsQuery = `SELECT * FROM OrderItems WHERE OrderId = ?`;
      const orderItems = await db.query(orderItemsQuery, [order.Id]);
      order.Items = orderItems;
    }

    return orders;
  }
}

export const orderService = new OrderService();
