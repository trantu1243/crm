const { Transaction, BankAccount } = require("../models");

const getMonthlyStats = async (req, res) => {
    try {
        let { month, year } = req.query;
        const today = new Date();

        // Nếu không có param, mặc định là tháng hiện tại
        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        // ✅ Chuyển mốc thời gian về múi giờ Việt Nam (UTC+7)
        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(year, month, 1, 0, 0, 0);
        const startOfMonthUTC = new Date(startOfMonth.getTime() - (7 * 60 * 60 * 1000));
        const endOfMonthUTC = new Date(endOfMonth.getTime() - (7 * 60 * 60 * 1000));

        // ✅ Xác định tháng trước
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const startOfLastMonth = new Date(lastYear, lastMonth - 1, 1, 0, 0, 0);
        const endOfLastMonth = new Date(lastYear, lastMonth, 1, 0, 0, 0);

        // Lấy số ngày đã qua trong tháng hiện tại (theo giờ Việt Nam)
        const daysPassedThisMonth = today.getDate();

        // Lấy tổng số ngày của tháng trước
        const daysInLastMonth = new Date(lastYear, lastMonth, 0).getDate();
       
        // Thống kê tổng trong tháng hiện tại
        const currentMonthStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
                    status: { $exists: true, $nin: [3, "3"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        // Thống kê tổng trong tháng trước
        const lastMonthStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
                    status: { $exists: true, $nin: [3, "3"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        const dailyStats = await Transaction.aggregate([
            {
                $addFields: {
                    createdAtVN: {
                        $dateAdd: {
                            startDate: "$createdAt",
                            unit: "hour",
                            amount: 7 // Chuyển từ UTC sang UTC+7
                        }
                    }
                }
            },
            {
                $match: {
                    createdAtVN: { $gte: startOfMonthUTC, $lt: endOfMonthUTC },
                    status: { $exists: true, $nin: [3, "3"] }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAtVN" }, // Lấy ngày theo giờ Việt Nam
                    totalAmount: { $sum: "$totalAmount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Lấy dữ liệu của tháng này và tháng trước
        const totalAmountThisMonth = currentMonthStats[0]?.totalAmount || 0;
        const totalAmountLastMonth = lastMonthStats[0]?.totalAmount || 0;

        const totalFeeThisMonth = currentMonthStats[0]?.totalFee || 0;
        const totalFeeLastMonth = lastMonthStats[0]?.totalFee || 0;

        const totalTransactionsThisMonth = currentMonthStats[0]?.totalTransactions || 0;
        const totalTransactionsLastMonth = lastMonthStats[0]?.totalTransactions || 0;

        // Tính trung bình mỗi ngày (tháng này chỉ tính đến ngày hiện tại)
        const avgPerDayAmountThisMonth = totalAmountThisMonth / daysPassedThisMonth;
        const avgPerDayAmountLastMonth = totalAmountLastMonth / daysInLastMonth;

        const avgPerDayFeeThisMonth = totalFeeThisMonth / daysPassedThisMonth;
        const avgPerDayFeeLastMonth = totalFeeLastMonth / daysInLastMonth;

        const avgPerDayTransactionsThisMonth = totalTransactionsThisMonth / daysPassedThisMonth;
        const avgPerDayTransactionsLastMonth = totalTransactionsLastMonth / daysInLastMonth;

        // Tính % thay đổi so với tháng trước
        const percentChangeAmount = avgPerDayAmountLastMonth !== 0
            ? ((avgPerDayAmountThisMonth - avgPerDayAmountLastMonth) / avgPerDayAmountLastMonth) * 100
            : 0;

        const percentChangeFee = avgPerDayFeeLastMonth !== 0
            ? ((avgPerDayFeeThisMonth - avgPerDayFeeLastMonth) / avgPerDayFeeLastMonth) * 100
            : 0;

        const percentChangeTransactions = avgPerDayTransactionsLastMonth !== 0
            ? ((avgPerDayTransactionsThisMonth - avgPerDayTransactionsLastMonth) / avgPerDayTransactionsLastMonth) * 100
            : 0;

        res.json({
            month: month,
            year: year,
            totalStats: {
                totalAmount: totalAmountThisMonth,
                totalFee: totalFeeThisMonth,
                totalTransactions: totalTransactionsThisMonth,
                percentChangeAmount: Math.round(percentChangeAmount),
                percentChangeFee: Math.round(percentChangeFee),
                percentChangeTransactions: Math.round(percentChangeTransactions)
            },
            lastMonthStats: {
                totalAmount: totalAmountLastMonth,
                totalFee: totalFeeLastMonth,
                totalTransactions: totalTransactionsLastMonth
            },
            dailyStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê theo tháng" });
    }
};


const getDailyStats = async (req, res) => {
    try {
        let { day, month, year } = req.query;
        const today = new Date();

        // Nếu không có param, mặc định là ngày hiện tại theo giờ Việt Nam (UTC+7)
        day = day ? parseInt(day) : today.getDate();
        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        // ✅ Chuyển mốc thời gian về múi giờ Việt Nam (UTC+7)
        const startOfDayVN = new Date(year, month - 1, day, 0, 0, 0); // Bắt đầu ngày 00:00:00 giờ Việt Nam
        const endOfDayVN = new Date(year, month - 1, day, 23, 59, 59); // Kết thúc ngày 23:59:59 giờ Việt Nam

        // ✅ Tổng tất cả giao dịch trong ngày theo giờ Việt Nam
        const totalStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDayVN, $lt: endOfDayVN },
                    status: { $exists: true, $nin: [3, "3"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        // ✅ Thống kê theo từng ngân hàng trong ngày
        const bankStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDayVN, $lt: endOfDayVN },
                    status: { $exists: true, $nin: [3, "3"] }
                }
            },
            {
                $group: {
                    _id: "$bankId",
                    totalAmount: { $sum: "$totalAmount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "bankaccounts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "bankInfo"
                }
            },
            {
                $unwind: { path: "$bankInfo", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 0, 
                    bankId: "$bankInfo._id",
                    bankCode: "$bankInfo.bankCode",
                    totalAmount: 1,
                    totalFee: 1,
                    totalTransactions: 1
                }
            }
        ]);

        const allBanks = await BankAccount.find({});

        const bankStatsMap = new Map();
        bankStats.forEach((stat) => {
            if (!stat.bankId) return;
            bankStatsMap.set(stat.bankId.toString(), stat);
        });

        allBanks.forEach((bank) => {
            const key = bank._id.toString();
            if (!bankStatsMap.has(key)) {
                bankStats.push({
                    bankId: bank._id,
                    bankCode: bank.bankCode || "",
                    totalAmount: 0,
                    totalFee: 0,
                    totalTransactions: 0,
                });
            }
        });

        res.json({
            day,
            month,
            year,
            totalStats: totalStats[0] || { totalAmount: 0, totalFee: 0, totalTransactions: 0 },
            bankStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê trong ngày" });
    }
};



module.exports = {
    getMonthlyStats,
    getDailyStats
}