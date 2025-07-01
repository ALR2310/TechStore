import { renameSync } from 'fs';
import path from 'path';
import { addressService } from '~/services/addressService';
import { brandService } from '~/services/brandService';
import { cartService } from '~/services/cartService';
import { categoryService } from '~/services/categoryService';
import { orderService } from '~/services/orderService';
import { productService } from '~/services/productService';
import { purchaseService } from '~/services/purchaseService';
import { reviewService } from '~/services/reviewService';
import { userService } from '~/services/userService';
import { viewedService } from '~/services/viewedService';

class ApiController {
  //#region Auth
  async checkLogin(req: any, res: any) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error checking login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  //#endregion

  //#region User
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
  //#endregion

  //#region Product
  async getListProduct(req: any, res: any) {
    const payload = req.query;

    try {
      const products = await productService.getListProduct(payload);
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching product list:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getProduct(req: any, res: any) {
    const { id } = req.params;

    try {
      const product = await productService.getProduct(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createProduct(req: any, res: any) {
    const payload = req.body;

    const absoImagePath = req.file ? req.file.path : null;
    let relaImagePath = absoImagePath ? path.relative(path.join(__dirname, '..', 'assets'), absoImagePath) : null;

    if (absoImagePath && req.body.slug) {
      const extname = path.extname(req.file.originalname);
      const newFileName = `${req.body.slug}${extname}`;
      const newFilePath = path.join(path.dirname(absoImagePath), newFileName);

      renameSync(absoImagePath, newFilePath);
      relaImagePath = path.relative(path.join(__dirname, '..', 'assets'), newFilePath);
    }

    try {
      const newProduct = await productService.createProduct({ ...payload, image: relaImagePath });
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateProduct(req: any, res: any) {
    const { id } = req.params;
    const payload = { id, ...req.body };

    const absoImagePath = req.file ? req.file.path : null;
    let relaImagePath = absoImagePath ? path.relative(path.join(__dirname, '..', 'assets'), absoImagePath) : null;

    if (absoImagePath && req.body.slug) {
      const extname = path.extname(req.file.originalname);
      const newFileName = `${req.body.slug}${extname}`;
      const newFilePath = path.join(path.dirname(absoImagePath), newFileName);

      renameSync(absoImagePath, newFilePath);
      relaImagePath = path.relative(path.join(__dirname, '..', 'assets'), newFilePath);
    }

    try {
      const updatedProduct = await productService.updateProduct({ ...payload, image: relaImagePath });
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteProduct(req: any, res: any) {
    const { id } = req.params;

    try {
      const productExists = await productService.getProduct(id);

      if (!productExists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await Promise.all([
        orderService.deleteOrderOfProduct(id),
        cartService.deleteCartOfProduct(id),
        purchaseService.deletePurchaseOfProduct(id),
        reviewService.deleteReviewOfProduct(id),
        viewedService.deleteViewedOfProduct(id),
      ]);

      await productService.deleteProduct(id);

      return res.status(204).json({
        message: 'Product deleted successfully',
        data: productExists,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  //#endregion

  //#region Category
  async getListCategory(req: any, res: any) {
    const payload = req.query;

    try {
      const categories = await categoryService.getListCategory(payload);
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching category list:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getCategory(req: any, res: any) {
    const { id } = req.params;

    try {
      const category = await categoryService.getCategory(id);
      return res.status(200).json(category);
    } catch (error: any) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createCategory(req: any, res: any) {
    const payload = req.body;

    try {
      const newCategory = await categoryService.createCategory(payload);
      return res.status(201).json(newCategory);
    } catch (error: any) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateCategory(req: any, res: any) {
    const { id } = req.params;
    const payload = { id, ...req.body };

    try {
      const updatedCategory = await categoryService.updateCategory(payload);
      return res.status(200).json(updatedCategory);
    } catch (error: any) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteCategory(req: any, res: any) {
    const { id } = req.params;

    try {
      const category = await categoryService.getCategory(id);

      for (const product of category.products) {
        await Promise.all([
          orderService.deleteOrderOfProduct(product.Id),
          cartService.deleteCartOfProduct(product.Id),
          purchaseService.deletePurchaseOfProduct(product.Id),
          reviewService.deleteReviewOfProduct(product.Id),
          viewedService.deleteViewedOfProduct(product.Id),
        ]);
        await productService.deleteProduct(product.Id);
      }
      await categoryService.deleteCategory(id);

      return res.status(204).json({
        message: 'Category deleted successfully',
        data: category,
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: error.message });
    }
  }
  //#endregion

  //#region Brand
  async getListBrand(req: any, res: any) {
    const payload = req.query;

    try {
      const brands = await brandService.getListBrand(payload);
      return res.status(200).json(brands);
    } catch (error) {
      console.error('Error fetching brand list:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  //#endregion

  //#region Order
  async getListOrder(req: any, res: any) {
    const payload = req.query;

    try {
      const orders = await orderService.getListOrder(payload);
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching order list:', error);
      res.status(500).json(error);
    }
  }

  async approveOrder(req: any, res: any) {
    const { id } = req.params;
    const payload = { id, ...req.body };

    try {
      const updatedOrder = await orderService.approveOrder(payload);
      return res.status(200).json(updatedOrder);
    } catch (error: any) {
      console.error('Error approving order:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  //#endregion

  //#region Review
  async getListReview(req: any, res: any) {
    const payload = req.query;

    try {
      const reviews = await reviewService.getListReview(payload);
      return res.status(200).json(reviews);
    } catch (error: any) {
      console.error('Error fetching review list:', error);
      res.status(500).send({ error: error.message });
    }
  }

  async updateStatusReview(req: any, res: any) {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const updatedReview = await reviewService.updateStatusReview(id, status);
      return res.status(200).json(updatedReview);
    } catch (error: any) {
      console.error('Error updating review status:', error);
      res.status(500).send({ error: error.message });
    }
  }

  async deleteReview(req: any, res: any) {
    const { id } = req.params;

    try {
      await reviewService.deleteReview(id);
      return res.status(204).json({
        message: 'Review deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  //#endregion
}

export const apiController = new ApiController();
