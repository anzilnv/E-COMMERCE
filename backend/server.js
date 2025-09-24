import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js'
import productroutes from './routes/product.route.js'
import cartroutes from './routes/cart.route.js'
import couponroutes from './routes/coupon.route.js'
import paymentRoutes from './routes/product.route.js'
import analyticsRoutes from './routes/analytics.route.js'
import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productroutes);
app.use('/api/cart', cartroutes);
app.use('/api/coupons', couponroutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);


app.listen(port, () => {
    console.log('Server is running on http://localhost:' + port);
    connectDB();
});