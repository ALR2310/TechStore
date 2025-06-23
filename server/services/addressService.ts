import { db } from '~/configs/dbConnect';

class AddressService {
  async getAddressByUser(userId: string) {
    const query = `
        SELECT *
        FROM Address A
        WHERE A.UserId = ?
        ORDER BY A.updatedAt DESC
        `;
    return await db.query(query, [userId]);
  }

  async deleteAddressOfUser(userId: string) {
    const exists = await this.getAddressByUser(userId);
    if (exists.length === 0) {
      return { message: 'No address found for this user.' };
    }

    const query = `DELETE FROM Address WHERE UserId = ?`;
    await db.query(query, [userId]);
    return { message: 'Address deleted successfully.' };
  }
}

export const addressService = new AddressService();
