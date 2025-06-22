import { cartService } from '~/services/cartService';
import { orderService } from '~/services/orderService';
import { reviewService } from '~/services/reviewService';
import { userService } from '~/services/userService';

class ApiController {
  async getListUser(req: any, res: any) {
    const payload = req.query;

    try {
      const users = await userService.getListUser(payload);
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching user list:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getUser(req: any, res: any) {
    const { id } = req.params;

    try {
      const user = await userService.getUser(id);
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateUser(req: any, res: any) {
    const { id } = req.params;
    const payload = { id, ...req.body };

    try {
      const updatedUser = await userService.updateUser(payload);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteUser(req: any, res: any) {
    const { id } = req.params;

    try {
      const [carts, orders, reviews] = await Promise.all([
        cartService.getCartByUser(id),
        orderService.getOrderByUser(id),
        reviewService.getReviewByUser(id),
      ]);

      if (carts.length > 0 || orders.length > 0 || reviews.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete user with existing carts, orders, or reviews',
          data: {
            carts,
            orders,
            reviews,
          },
        });
      }

      const userDeleted = await userService.deleteUser(id);

      return res.status(204).json({
        message: 'User deleted successfully',
        data: userDeleted,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const apiController = new ApiController();
