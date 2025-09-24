import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import express from "express"
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const Router = express.Router();

Router.get("/", protectRoute, adminRoute, async (req, res) => {

    try {
        const analyticsData = await getAnalyticsData(); // Assume this function fetches analytics data

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        const dailySales = await getDailySalesData(startDate, endDate); // Assume this function fetches daily sales data
        res.json({ analyticsData, dailySales });
    } catch (error) {
        console.log("Error in the Analytics route", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }

})

export default Router