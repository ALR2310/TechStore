import { addressService } from '~/services/addressService';
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

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const [carts, orders, reviews] = await Promise.all([
        cartService.getCartByUser(id),
        orderService.getOrderByUser(id),
        reviewService.getReviewByUser(id),
      ]);

      user.carts = carts;
      user.orders = orders;
      user.reviews = reviews;

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
      const userExists = await userService.getUser(id);

      if (!userExists) {
        return res.status(404).json({ error: 'User not found' });
      }

      await addressService.deleteAddressOfUser(id);
      await orderService.deleteOrderOfUser(id);
      await cartService.deleteCartOfUser(id);
      await userService.deleteUser(id);

      return res.status(204).json({
        message: 'User deleted successfully',
        data: userExists,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const apiController = new ApiController();
