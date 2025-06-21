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
}

export const apiController = new ApiController();
