import express from 'express';
import { addToCart, getAllCartProducts, removeAllCart, updateCart } from '../controllers/cart.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';


const router = express.Router();

router.get('/', protectRoute, getAllCartProducts)
router.post('/', protectRoute, addToCart)
router.delete('/', protectRoute, removeAllCart)
router.put('/:id', protectRoute, updateCart)

export default router;