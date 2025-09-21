import Product from "../model/product.model.js";

export const getAllCartProducts = async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: req.user.cartItems } })

        //add quatity for each 
        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.Id === product.id)
            return { ...product.toJSON(), quatity: item.quatity }
        })
    } catch (error) {
        console.log("Error in getAllCartProducts Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const addToCart = async (req, res) => {

    try {
        const { productId } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(item => item.id === productId)
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push(productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const removeAllCart = async (req, res) => {

    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in removeAllCart Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const updateCart = async (req, res) => {

    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(item => item.id === productId);

        if (existingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => item.id !== productId)
                await user.save();
                res.json(user.cartItems);
            }

            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.log("Error in updateCart Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}