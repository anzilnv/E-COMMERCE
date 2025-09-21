import Coupon from "../model/coupon.model.js"

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true })
        res.json(coupon || null)
    } catch (error) {
        console.log("Error in getCoupon Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true })
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not Found " })
        }

        if (coupon.expiringDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return res.status(404).json({message:"Coupon is expired "})
        }

        res.json({
            message:"Coupon is valid",
            code:coupon.code,
            discoutPercentage:coupon.discoutePercentage
        })
    } catch (error) {
        console.log("Error in validateCoupon Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}