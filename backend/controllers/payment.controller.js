import Order from '../models/order.model.js';
import Coupon from '../models/coupon.model.js';
import { stripe } from '../utils/stripe.js';


export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products array is required and cannot be empty' });
        }

        let totalAmount = 0;
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100) // stripe want to send in the format of the cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: [product.image]
                    },
                    unit_amount: amount,
                }
            }
        })

        let coupon = null;
        if (coupon) {
            coupon = await Coupon.findOne({ code: couponCode, isActive: true, userId: req.user._id });
            totalAmount -= (totalAmount * coupon.discountPercetage) / 100;
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_Url: `${process.env.CLIENT_URL}/purchase-success?sesion_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchace-cancel`,
            discounts: coupon ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercetage)
                },
            ]
                :
                [],
            metaData: {
                userId: req.user._id,
                couponId: couponCode || "",
            }
        })

        if (totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {

    }
}
export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                await Coupon.findByIdAndUpdate({
                    code: session.metadata.couponCode, userId: session.metadata.userId
                }, { isActive: false });

            }
        }

        // create a new order in the database
        const products = JSON.parse(session.metadata.products);
        const newOrder = new Order({
            userId: session.metadata.userId,
            products: products.map((p) => ({
                productId: p.id,
                quantity: p.quantity,
                price: p.price
            })),
            totalamount: session.amount_total / 100, // convert from cents   to dollars
            stripeSessionId: sessionId,
        });
        await newOrder.save();
        res.status(200).json({
            sucess: true,
            message: 'Order created successfully',
            order: newOrder._id,
        });
    } catch (error) {
        console.error('Error in /checkout-success:', error);
        res.status(500).json({ success: false, message: 'Error process in the checkout sucess', error: error.message });
    }
}
async function createStripeCoupon(discountPercetage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercetage,
        duration: 'once',
    });
    return coupon.id;
}

async function createNewCoupon(userId) {
    const newCoupon = new Coupon({
        code: "Gift" + Math.random().toString(36).substring(2, 7).toUpperCase(),
        discountPercetage: 10,
        userId: userId,
        products: JSON.stringify(
            products.map((p) => ({
                id: p._id,
                quantity: p.quantity,
                price: p.price
            }))
        )
    })
    await newCoupon.save();

    return newCoupon;
}