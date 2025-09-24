import Product from "../model/product.model.js";
import User from "../model/user.model.js";
import Order from "../model/order.model.js";

export const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group:
            {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            }
        }
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue
    }

}

export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            },
        ])
        // data of anaytics chart dailySalesData
        // [
        //     {
        //         _id: '2023-10-01',
        //         sales: 5,
        //         revenue: 500
        //     },
        //     {
        //         _id: '2023-10-02',
        //         sales: 3,
        //         revenue: 300
        //     }
        // ]
        const dataArray = getDateInRange(startDate, endDate).map(date => {
            const foundData = dailySalesData.find(data => data._id === dateString);
            return {
                date: dateString,
                sales: foundData ? foundData.sales : 0,
                revenue: foundData ? foundData.revenue : 0
            }
        })
    } catch (error) {
        throw error;
    }
}

function getDateInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}