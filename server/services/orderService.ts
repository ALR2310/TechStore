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

      const orderItemsQuery = `SELECT * FROM OrderItems WHERE OrdId = ?`;
      const orderItems = await db.query(orderItemsQuery, [order.Id]);
      order.Items = orderItems;
    }

    return orders;
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
}

export const orderService = new OrderService();
