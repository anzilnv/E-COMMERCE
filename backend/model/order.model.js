import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "product",
                    required: true
                },
                quatity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        stripeSessionId: {
            type: String,
            required: true,
            unique: true
        },
    }, { timestamps: true }
);

const Order=mongoose.model("order",orderSchema);

export default Order;