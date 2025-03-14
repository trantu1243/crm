const { default: mongoose } = require("mongoose");
const { Transaction, BankAccount, Staff, BoxTransaction, Bill } = require("../models");

const statusNames = {
    1: "Chưa nhận",
    2: "Thành công",
    3: "Hủy",
    6: "Đã nhận",
    7: "Đang xử lý",
    8: "Hoàn thành một phần"
};
  
const allStatuses = [1, 2, 3, 6, 7, 8];

const convertToStatusMap = (arr) => {

    const result = {};
    allStatuses.forEach((st) => {
        result[st] = {
            name: statusNames[st],
            count: 0
        };
    });

    arr.forEach((item) => {
        const status = item._id;
        const count = item.amount;
        if (result[status]) {
        result[status].count = count;
        }
    });

    return result;
};

const getMonthlyStats = async (req, res) => {
    try {
        let { month, year } = req.query;
        const today = new Date();

        const vietnamOffset = 7 * 60 * 60 * 1000; // 7 giờ tính bằng mili giây
        const todayVietnam = new Date(today.getTime() + vietnamOffset);

        // Nếu không có param, mặc định là tháng hiện tại
        month = month ? parseInt(month) : todayVietnam.getMonth() + 1;
        year = year ? parseInt(year) : todayVietnam.getFullYear();

        // Tính startOfMonth và endOfMonth theo giờ local (không cần trừ thêm)
        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(year, month, 1, 0, 0, 0);
        const startOfMonthUTC = new Date(startOfMonth.getTime() - vietnamOffset);
        const endOfMonthUTC = new Date(endOfMonth.getTime() - vietnamOffset);

        // Tháng trước
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const startOfLastMonth = new Date(lastYear, lastMonth - 1, 1, 0, 0, 0);
        const endOfLastMonth = new Date(lastYear, lastMonth, 1, 0, 0, 0);
        const startOfLastMonthUTC = new Date(startOfLastMonth.getTime() - vietnamOffset);
        const endOfLastMonthUTC = new Date(endOfLastMonth.getTime() - vietnamOffset);

        // Tính số ngày đã qua trong tháng
        let daysPassedThisMonth;
        if (month === todayVietnam.getMonth() + 1 && year === todayVietnam.getFullYear()) {
            daysPassedThisMonth = todayVietnam.getDate(); // Đã đúng giờ Việt Nam
        } else {
            daysPassedThisMonth = new Date(year, month, 0).getDate(); // Tổng ngày trong tháng
        }

        const daysInLastMonth = new Date(lastYear, lastMonth, 0).getDate();
       
        // Thống kê tổng trong tháng hiện tại
        const currentMonthStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonthUTC, $lt: endOfMonthUTC },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        // Thống kê tổng trong tháng trước
        const lastMonthStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLastMonthUTC, $lt: endOfLastMonthUTC },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
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
                    createdAtVN: { $gte: startOfMonth, $lt: endOfMonth },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAtVN" }, // Lấy ngày theo giờ Việt Nam
                    totalAmount: { $sum: "$amount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const billStats = await Bill.aggregate([
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
                    createdAtVN: { $gte: startOfMonth, $lt: endOfMonth },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAtVN" }, // Lấy ngày theo giờ Việt Nam
                    totalBillAmount: { $sum: "$amount" },
                    totalBill: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const dailyStatsMap = new Map(dailyStats.map(item => [item._id, item]));
        const billStatsMap = new Map(billStats.map(item => [item._id, item]));

        const allDays = new Set([...dailyStatsMap.keys(), ...billStatsMap.keys()]);
        const mergedStats = [];

        for (const day of allDays) {
            mergedStats.push({
                day,
                totalAmount: dailyStatsMap.get(day)?.totalAmount || 0,
                totalFee: dailyStatsMap.get(day)?.totalFee || 0,
                totalTransactions: dailyStatsMap.get(day)?.totalTransactions || 0,
                totalBillAmount: billStatsMap.get(day)?.totalBillAmount || 0,
                totalBill: billStatsMap.get(day)?.totalBill || 0
            });
        }

        mergedStats.sort((a, b) => a.day - b.day);

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
            dailyStats: mergedStats,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê theo tháng" });
    }
};

const getTotalTransaction = async (req, res) => {
    try {
        let { day, month, year } = req.query;
        const today = new Date();

        day = day ? parseInt(day) : today.getDate();
        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        const startOfDayVN = new Date(year, month - 1, day, 0, 0, 0); // Bắt đầu ngày 00:00:00 giờ Việt Nam
        const endOfDayVN = new Date(year, month - 1, day, 23, 59, 59); // Kết thúc ngày 23:59:59 giờ Việt Nam
        const startOfDayUTC = new Date(startOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        const endOfDayUTC = new Date(endOfDayVN.getTime() - (7 * 60 * 60 * 1000));

        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(year, month, 1, 0, 0, 0);
        const startOfMonthUTC = new Date(startOfMonth.getTime() - (7 * 60 * 60 * 1000));
        const endOfMonthUTC = new Date(endOfMonth.getTime() - (7 * 60 * 60 * 1000));

        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const startOfLastMonth = new Date(lastYear, lastMonth - 1, 1, 0, 0, 0);
        const endOfLastMonth = new Date(lastYear, lastMonth, 1, 0, 0, 0);
        const startOfLastMonthUTC = new Date(startOfLastMonth.getTime() - (7 * 60 * 60 * 1000));
        const endOfLastMonthUTC = new Date(endOfLastMonth.getTime() - (7 * 60 * 60 * 1000));

        const results = await Transaction.aggregate([
            {
                $facet: {
                    today: [
                        { 
                            $match: {
                                createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC }
                            }
                        },
                        {
                            $group: {
                                _id: "$status",             
                                amount: { $sum: 1 }
                            }
                        }
                        ],
                        currentMonth: [
                        {
                            $match: {
                                createdAt: { $gte: startOfMonthUTC, $lt: endOfMonthUTC }
                            }
                        },
                        {
                            $group: {
                                _id: "$status",
                                amount: { $sum: 1 }
                            }
                        }
                        ],
                        lastMonth: [
                        {
                            $match: {
                                createdAt: { $gte: startOfLastMonthUTC, $lt: endOfLastMonthUTC }
                            }
                        },
                        {
                            $group: {
                                _id: "$status",
                                amount: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const [stats] = results;
    
        const responseData = {
            today: convertToStatusMap(stats.today || []),
            currentMonth: convertToStatusMap(stats.currentMonth || []),
            lastMonth: convertToStatusMap(stats.lastMonth || []),
        };

        res.json({
            data: responseData
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
        const startOfDayUTC = new Date(startOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        const endOfDayUTC = new Date(endOfDayVN.getTime() - (7 * 60 * 60 * 1000));

        // ✅ Tổng tất cả giao dịch trong ngày theo giờ Việt Nam
        const totalStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC },
                    status: { $exists: true, $nin: [3, "3" , 1 , "1"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        // ✅ Thống kê theo từng ngân hàng trong ngày
        const bankStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: "$bankId",
                    totalAmount: { $sum: "$amount" },
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
                    bankName: "$bankInfo.bankName",
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
                    bankName: bank.bankName || "",
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

const getBalance = async (req, res) => {
    try {
        const totalAmount = await BoxTransaction.aggregate([
            { 
                $match: { amount: { $gt: 0 } } // Lọc các box có amount > 0
            },
            {
                $group: {
                    _id: null, // Gom tất cả thành một nhóm
                    totalAmount: { $sum: "$amount" } // Tính tổng amount
                }
            }
        ]);
        
        const boxes = await BoxTransaction.find({ amount: { $gt: 0 } });
        
        const updatedBoxes = await Promise.all(boxes.map(async (box) => {
            const transaction = await Transaction.findOne({ boxId: box._id, status: {$in: [6, 7, 8]} })
            .sort({ createdAt: -1 }) 
            .populate([
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' }
            ]);

            return {
                _id: box._id,
                bankId: transaction ? transaction.bankId._id.toString() : null,
                bankName: transaction ? transaction.bankId.bankName : null,
                amount: box.amount
            };
        }));
        
        // Nhóm và tính tổng amount theo bankId, đồng thời lưu cả bankName
        const amountByBank = updatedBoxes.reduce((acc, box) => {
            if (box.bankId) {
                const bankIdStr = box.bankId.toString();
                if (!acc[bankIdStr]) {
                    acc[bankIdStr] = {
                        bankId: bankIdStr,
                        bankName: box.bankName,
                        totalAmount: 0
                    };
                }
                acc[bankIdStr].totalAmount += box.amount;
            }
            return acc;
        }, {});
        
        // Chuyển object về mảng để dễ đọc
        const resultArray = Object.values(amountByBank);
        
        res.status(200).json({
            message: 'Bank Accounts fetched successfully',
            data: resultArray,
            total: totalAmount[0]?.totalAmount || 0
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getStaffMonthlyStats = async (req, res) => {
    try {
        let { staffId, month, year } = req.query;
        if (!staffId) {
            return res.status(400).json({ message: "Vui lòng cung cấp staffId" });
        }

        const user = await Staff.findById(req.user.id);

        if (req.user.id !== staffId && user.is_admin === 0) {
            return res.status(400).json({ message: "Không đủ quyền" });
        }

        const staffObjectId = new mongoose.Types.ObjectId(staffId);

        const today = new Date();
        
        const vietnamOffset = 7 * 60 * 60 * 1000; // 7 giờ tính bằng mili giây
        const todayVietnam = new Date(today.getTime() + vietnamOffset);

        // Nếu không có param, mặc định là tháng hiện tại
        month = month ? parseInt(month) : todayVietnam.getMonth() + 1;
        year = year ? parseInt(year) : todayVietnam.getFullYear();

        // Tính startOfMonth và endOfMonth theo giờ local (không cần trừ thêm)
        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(year, month, 1, 0, 0, 0);
        const startOfMonthUTC = new Date(startOfMonth.getTime() - vietnamOffset);
        const endOfMonthUTC = new Date(endOfMonth.getTime() - vietnamOffset);

        // Tháng trước
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const startOfLastMonth = new Date(lastYear, lastMonth - 1, 1, 0, 0, 0);
        const endOfLastMonth = new Date(lastYear, lastMonth, 1, 0, 0, 0);
        const startOfLastMonthUTC = new Date(startOfLastMonth.getTime() - vietnamOffset);
        const endOfLastMonthUTC = new Date(endOfLastMonth.getTime() - vietnamOffset);

        // Tính số ngày đã qua trong tháng
        let daysPassedThisMonth;
        if (month === todayVietnam.getMonth() + 1 && year === todayVietnam.getFullYear()) {
            daysPassedThisMonth = todayVietnam.getDate(); // Đã đúng giờ Việt Nam
        } else {
            daysPassedThisMonth = new Date(year, month, 0).getDate(); // Tổng ngày trong tháng
        }

        const daysInLastMonth = new Date(lastYear, lastMonth, 0).getDate();

        // 🔹 Thống kê tháng hiện tại
        const currentMonthStats = await Transaction.aggregate([
            {
                $match: {
                    staffId: staffObjectId,
                    createdAt: { $gte: startOfMonthUTC, $lt: endOfMonthUTC },
                    status: { $exists: true, $nin: [3, "3" , 1, "1"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        // 🔹 Thống kê tháng trước
        const lastMonthStats = await Transaction.aggregate([
            {
                $match: {
                    staffId: staffObjectId,
                    createdAt: { $gte: startOfLastMonthUTC, $lt: endOfLastMonthUTC },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        // 🔹 Thống kê theo ngày
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
                    staffId: staffObjectId,
                    createdAtVN: { $gte: startOfMonth, $lt: endOfMonth },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAtVN" }, // Lấy ngày theo giờ Việt Nam
                    totalAmount: { $sum: "$amount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const billStats = await Bill.aggregate([
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
                    staffId: staffObjectId,
                    createdAtVN: { $gte: startOfMonth, $lt: endOfMonth },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAtVN" }, // Lấy ngày theo giờ Việt Nam
                    totalBillAmount: { $sum: "$amount" },
                    totalBill: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const dailyStatsMap = new Map(dailyStats.map(item => [item._id, item]));
        const billStatsMap = new Map(billStats.map(item => [item._id, item]));

        const allDays = new Set([...dailyStatsMap.keys(), ...billStatsMap.keys()]);
        const mergedStats = [];

        for (const day of allDays) {
            mergedStats.push({
                day,
                totalAmount: dailyStatsMap.get(day)?.totalAmount || 0,
                totalFee: dailyStatsMap.get(day)?.totalFee || 0,
                totalTransactions: dailyStatsMap.get(day)?.totalTransactions || 0,
                totalBillAmount: billStatsMap.get(day)?.totalBillAmount || 0,
                totalBill: billStatsMap.get(day)?.totalBill || 0
            });
        }

        mergedStats.sort((a, b) => a.day - b.day);

        // Lấy dữ liệu của tháng này và tháng trước
        const totalAmountThisMonth = currentMonthStats[0]?.totalAmount || 0;
        const totalAmountLastMonth = lastMonthStats[0]?.totalAmount || 0;

        const totalFeeThisMonth = currentMonthStats[0]?.totalFee || 0;
        const totalFeeLastMonth = lastMonthStats[0]?.totalFee || 0;

        const totalTransactionsThisMonth = currentMonthStats[0]?.totalTransactions || 0;
        const totalTransactionsLastMonth = lastMonthStats[0]?.totalTransactions || 0;

        // 🔹 Tính trung bình mỗi ngày
        const avgPerDayAmountThisMonth = totalAmountThisMonth / daysPassedThisMonth;
        const avgPerDayAmountLastMonth = totalAmountLastMonth / daysInLastMonth;

        const avgPerDayFeeThisMonth = totalFeeThisMonth / daysPassedThisMonth;
        const avgPerDayFeeLastMonth = totalFeeLastMonth / daysInLastMonth;

        const avgPerDayTransactionsThisMonth = totalTransactionsThisMonth / daysPassedThisMonth;
        const avgPerDayTransactionsLastMonth = totalTransactionsLastMonth / daysInLastMonth;

        // 🔹 Tính phần trăm thay đổi
        const percentChangeAmount = avgPerDayAmountLastMonth !== 0
            ? ((avgPerDayAmountThisMonth - avgPerDayAmountLastMonth) / avgPerDayAmountLastMonth) * 100
            : 0;

        const percentChangeFee = avgPerDayFeeLastMonth !== 0
            ? ((avgPerDayFeeThisMonth - avgPerDayFeeLastMonth) / avgPerDayFeeLastMonth) * 100
            : 0;

        const percentChangeTransactions = avgPerDayTransactionsLastMonth !== 0
            ? ((avgPerDayTransactionsThisMonth - avgPerDayTransactionsLastMonth) / avgPerDayTransactionsLastMonth) * 100
            : 0;

        const staffInfo = await Staff.findById(staffId).select('name_staff email uid_facebook avatar is_admin permission_bank roles phone_staff');

        if (!staffInfo) {
            return res.status(404).json({ message: "Nhân viên không tồn tại" });
        }

        res.json({
            staff: staffInfo,
            month,
            year,
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
            dailyStats: mergedStats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê theo nhân viên" });
    }
};

const getDailyBankStatsByStaff = async (req, res) => {
    try {
        let { staffId, day, month, year } = req.query;

        if (!staffId) {
            return res.status(400).json({ message: "Vui lòng cung cấp staffId" });
        }

        const user = await Staff.findById(req.user.id);

        if (req.user.id !== staffId && user.is_admin === 0) {
            return res.status(400).json({ message: "Không đủ quyền" });
        }

        const staffObjectId = new mongoose.Types.ObjectId(staffId);

        const today = new Date();

        // Nếu không có param, mặc định là ngày hiện tại theo giờ Việt Nam (UTC+7)
        day = day ? parseInt(day) : today.getDate();
        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        // ✅ Xác định khoảng thời gian từ 00:00:00 đến 23:59:59 theo giờ Việt Nam
        const startOfDayVN = new Date(year, month - 1, day, 0, 0, 0);
        const endOfDayVN = new Date(year, month - 1, day, 23, 59, 59);
        const startOfDayUTC = new Date(startOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        const endOfDayUTC = new Date(endOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        // 🔹 **Tổng tất cả giao dịch trong ngày của nhân viên**
        const totalStats = await Transaction.aggregate([
            {
                $match: {
                    staffId: staffObjectId,
                    createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalFee: { $sum: "$fee" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        // 🔹 **Thống kê giao dịch của nhân viên theo ngân hàng trong ngày**
        const bankStats = await Transaction.aggregate([
            {
                $match: {
                    staffId: staffObjectId,
                    createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC },
                    status: { $exists: true, $nin: [3, "3", 1, "1"] }
                }
            },
            {
                $group: {
                    _id: "$bankId",
                    totalAmount: { $sum: "$amount" },
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
                    bankName: "$bankInfo.bankName",
                    totalAmount: 1,
                    totalFee: 1,
                    totalTransactions: 1
                }
            }
        ]);

        // 🔹 **Lấy danh sách tất cả ngân hàng** để hiển thị ngân hàng không có giao dịch
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
                    bankName: bank.bankName || "",
                    totalAmount: 0,
                    totalFee: 0,
                    totalTransactions: 0
                });
            }
        });

        // ✅ **Lấy thông tin nhân viên**
        const staffInfo = await Staff.findById(staffId).select('name_staff email uid_facebook avatar is_admin permission_bank roles phone_staff');

        if (!staffInfo) {
            return res.status(404).json({ message: "Nhân viên không tồn tại" });
        }

        // ✅ **Trả kết quả**
        res.json({
            staff: staffInfo,
            day,
            month,
            year,
            totalStats: totalStats[0] || { totalAmount: 0, totalFee: 0, totalTransactions: 0 },
            bankStats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê theo ngân hàng của nhân viên trong ngày" });
    }
};

const getTransactionStatsByStaff = async (req, res) => {
    try {
        let { staffId, day, month, year } = req.query;

        if (!staffId) {
            return res.status(400).json({ message: "Vui lòng cung cấp staffId" });
        }

        const user = await Staff.findById(req.user.id);

        if (req.user.id !== staffId && user.is_admin === 0) {
            return res.status(400).json({ message: "Không đủ quyền" });
        }

        const staffObjectId = new mongoose.Types.ObjectId(staffId);

        const today = new Date();

        // Nếu không có param, mặc định là ngày hiện tại theo giờ Việt Nam (UTC+7)
        day = day ? parseInt(day) : today.getDate();
        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        // ✅ Xác định khoảng thời gian từ 00:00:00 đến 23:59:59 theo giờ Việt Nam
        const startOfDayVN = new Date(year, month - 1, day, 0, 0, 0);
        const endOfDayVN = new Date(year, month - 1, day, 23, 59, 59);
        const startOfDayUTC = new Date(startOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        const endOfDayUTC = new Date(endOfDayVN.getTime() - (7 * 60 * 60 * 1000));

        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(year, month, 1, 0, 0, 0);
        const startOfMonthUTC = new Date(startOfMonth.getTime() - (7 * 60 * 60 * 1000));
        const endOfMonthUTC = new Date(endOfMonth.getTime() - (7 * 60 * 60 * 1000));


        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const startOfLastMonth = new Date(lastYear, lastMonth - 1, 1, 0, 0, 0);
        const endOfLastMonth = new Date(lastYear, lastMonth, 1, 0, 0, 0);
        const startOfLastMonthUTC = new Date(startOfLastMonth.getTime() - (7 * 60 * 60 * 1000));
        const endOfLastMonthUTC = new Date(endOfLastMonth.getTime() - (7 * 60 * 60 * 1000));
    
        // Tạo object match chung cho staffId (nếu có)
        // Nếu không có staffId, thì không lọc staffId (tức là lấy tất cả)
        const staffMatch = { staffId: staffObjectId };
    
        // Sử dụng \$facet để gom 3 truy vấn trong 1 pipeline
        const results = await Transaction.aggregate([
            {
                $facet: {
                    today: [
                        { 
                            $match: {
                                ...staffMatch,
                                createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC }
                            }
                        },
                        {
                            $group: {
                                _id: "$status",             
                                amount: { $sum: 1 }
                            }
                        }
                        ],
                        currentMonth: [
                        {
                            $match: {
                                ...staffMatch,
                                createdAt: { $gte: startOfMonthUTC, $lt: endOfMonthUTC }
                            }
                        },
                        {
                            $group: {
                                _id: "$status",
                                amount: { $sum: 1 }
                            }
                        }
                        ],
                        lastMonth: [
                        {
                            $match: {
                                ...staffMatch,
                                createdAt: { $gte: startOfLastMonthUTC, $lt: endOfLastMonthUTC }
                            }
                        },
                        {
                            $group: {
                                _id: "$status",
                                amount: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);
    
        const [stats] = results;

        const transationBonus = await Transaction.aggregate([
            {
                $match: { 
                    staffId: staffObjectId,
                    createdAt: { $gte: startOfMonthUTC, $lte: endOfMonthUTC }
                },
            },
            {
                $group: {
                    _id: null, 
                    totalBonus: { $sum: "$bonus" } 
                }
            }
        ]);

        const billBonus = await Bill.aggregate([
            {
                $match: { 
                    staffId: staffObjectId,
                    createdAt: { $gte: startOfMonthUTC, $lte: endOfMonthUTC }
                },
            },
            {
                $group: {
                    _id: null, 
                    totalBonus: { $sum: "$bonus" } 
                }
            }
        ]);
    
        const responseData = {
            today: convertToStatusMap(stats.today || []),
            currentMonth: convertToStatusMap(stats.currentMonth || []),
            lastMonth: convertToStatusMap(stats.lastMonth || []),
            bonus: [
                { name: "GDTG", value: transationBonus.length > 0 ? transationBonus[0].totalBonus : 0 },
                { name: "Thanh khoản", value: billBonus.length > 0 ? billBonus[0].totalBonus : 0 }
            ],
          };
    
        return res.status(200).json({
            message: "Lấy thống kê giao dịch thành công",
            data: responseData,
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
};

async function listActiveBoxAmountByBank(req, res) {
    try {
        const totalAmount = await BoxTransaction.aggregate([
            { 
                $match: { amount: { $gt: 0 } } // Lọc các box có amount > 0
            },
            {
                $group: {
                    _id: null, // Gom tất cả thành một nhóm
                    totalAmount: { $sum: "$amount" } // Tính tổng amount
                }
            }
        ]);

        const results = await Transaction.aggregate([
            {
                $lookup: {
                    from: "boxtransactions",  
                    localField: "boxId",
                    foreignField: "_id",
                    as: "boxInfo"
                }
            },
            { $unwind: "$boxInfo" },
            {
                $match: { "boxInfo.amount": { $gt: 0 }  }
            },
            {
                $lookup: {
                    from: "bankaccounts",  
                    localField: "bankId",
                    foreignField: "_id",
                    as: "bankInfo"
                }
            },
            { $unwind: "$bankInfo" },
            {
                $group: {
                    _id: "$bankInfo._id",
                    bankName: { $first: "$bankInfo.bankName" },
                    bankCode: { $first: "$bankInfo.bankCode" },
                    boxAmounts: { $addToSet: "$boxInfo.amount" },
                }
            },
            {
                $project: {
                    _id: 0,
                    bankId: "$_id",
                    bankName: 1,
                    bankCode: 1,
                    totalAmount: { $sum: "$boxAmounts" } 
                }
            },
            { $sort: { amount: -1 } }
        ]);
    
        res.status(200).json({
            message: "Danh sách ngân hàng + tổng Box.amount (active)",
            data: results,
            total: totalAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


async function listActiveBoxAmountByStaff(req, res) {
    try {
        let { staffId, day, month, year } = req.query;

        if (!staffId) {
            return res.status(400).json({ message: "Vui lòng cung cấp staffId" });
        }

        const user = await Staff.findById(req.user.id);

        if (req.user.id !== staffId && user.is_admin === 0) {
            return res.status(400).json({ message: "Không đủ quyền" });
        }

        const today = new Date();

        day = day ? parseInt(day) : today.getDate();
        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        const startOfDayVN = new Date(year, month - 1, day, 0, 0, 0);
        const endOfDayVN = new Date(year, month - 1, day, 23, 59, 59);
        
        const startOfDayUTC = new Date(startOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        const endOfDayUTC = new Date(endOfDayVN.getTime() - (7 * 60 * 60 * 1000));

        const matchTransaction = {};
        matchTransaction.staffId = new mongoose.Types.ObjectId(staffId);
      
        const matchBox = { "boxInfo.amount": { $gt: 0 }  };
        if (startOfDayUTC && endOfDayUTC) {
            matchBox["boxInfo.createdAt"] = {
                $gte: startOfDayUTC,
                $lte: endOfDayUTC
            };
        }
  
        const results = await Transaction.aggregate([
            { $match: matchTransaction },
            {
                $lookup: {
                    from: "boxtransactions",
                    localField: "boxId",
                    foreignField: "_id",
                    as: "boxInfo"
                }
            },
            { $unwind: "$boxInfo" },
            { $match: matchBox },
            {
                $lookup: {
                    from: "bankaccounts",
                    localField: "bankId",
                    foreignField: "_id",
                    as: "bankInfo"
                }
            },
            { $unwind: "$bankInfo" },
            {
                $group: {
                    _id: "$bankInfo._id",
                    bankName: { $first: "$bankInfo.bankName" },
                    bankCode: { $first: "$bankInfo.bankCode" },
                    boxAmounts: { $addToSet: "$boxInfo.amount" }, 
                }
            },
            {
                $project: {
                    _id: 0,
                    bankId: "$_id",
                    bankName: 1,
                    bankCode: 1,
                    totalAmount: { $sum: "$boxAmounts" }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);
  
        return res.status(200).json({
            message: "Danh sách ngân hàng + tổng box.amount (Box active, Transaction lọc staffId)",
            data: results
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getStaffShareInMonth(req, res) {
    try {
        let { staffId, year, month } = req.query;

        if (!staffId) {
            return res.status(400).json({ message: "Vui lòng cung cấp staffId" });
        }

        const user = await Staff.findById(req.user.id);

        if (req.user.id !== staffId && user.is_admin === 0) {
            return res.status(400).json({ message: "Không đủ quyền" });
        }

        const today = new Date();

        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(year, month, 1, 0, 0, 0);
        const startOfMonthUTC = new Date(startOfMonth.getTime() - (7 * 60 * 60 * 1000));
        const endOfMonthUTC = new Date(endOfMonth.getTime() - (7 * 60 * 60 * 1000));

        const staffObjectId = new mongoose.Types.ObjectId(staffId);
    
        const billCount = await Bill.aggregate([
            {
                $match: {
                    staffId: staffObjectId,
                    createdAt: { $gte: startOfMonthUTC, $lte: endOfMonthUTC },
                    status: 2
                }
            },
            {
                $group: {
                    _id: null,
                    totalBills: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        const bills = await Bill.find({ staffId: staffObjectId, status: 2, createdAt: { $gte: startOfMonthUTC, $lte: endOfMonthUTC } });
        
        let totalKPI = 0;

        for (const bill of bills) {
            const { boxId, flag } = bill;

            const billCount = await Bill.countDocuments({ boxId, flag, status: 2 });

            const transactionCount = await Transaction.countDocuments({ boxId, flag, status: { $nin: [3] } });

            if (billCount > 0) {
                const kpi = (1 / billCount) * transactionCount;
                totalKPI += kpi;
            }
        }
    
        return res.status(200).json({
            message: "Tổng phần chia của Staff A trong tháng",
            staffId,
            year,
            month,
            totalBills: billCount[0]?.totalBills || 0,
            totalAmount: billCount[0]?.totalAmount || 0,
            kpi: totalKPI,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


async function getDailyShareOfStaff(req, res) {
    try {
      let { staffId, day, month, year } = req.query;
  
     if (!staffId) {
            return res.status(400).json({ message: "Vui lòng cung cấp staffId" });
        }

        const user = await Staff.findById(req.user.id);

        if (req.user.id !== staffId && user.is_admin === 0) {
            return res.status(400).json({ message: "Không đủ quyền" });
        }

        const staffObjectId = new mongoose.Types.ObjectId(staffId);

        const today = new Date();

        day = day ? parseInt(day) : today.getDate();
        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        const startOfDayVN = new Date(year, month - 1, day, 0, 0, 0);
        const endOfDayVN = new Date(year, month - 1, day, 23, 59, 59);
        const startOfDayUTC = new Date(startOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        const endOfDayUTC = new Date(endOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        

        const bills = await Bill.find({ staffId: staffObjectId, status: 2, createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } });
        
        let totalKPI = 0;

        for (const bill of bills) {
            const { boxId, flag } = bill;

            const billCount = await Bill.countDocuments({ boxId, flag, status: 2 });

            const transactionCount = await Transaction.countDocuments({ boxId, flag, status: { $nin: [3] } });

            if (billCount > 0) {
                const kpi = (1 / billCount) * transactionCount;
                totalKPI += kpi;
            }
        }

        const billCount = await Bill.aggregate([
            {
                $match: {
                    staffId: staffObjectId,
                    createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC },
                    status: 2
                }
            },
            {
                $group: {
                    _id: null,
                    totalBills: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);
    
        return res.status(200).json({
            message: "Phần chia của staff trong 1 ngày",
            date: `${day}-${month}-${year}`,
            staffId,
            totalBills: billCount[0]?.totalBills || 0,
            totalAmount: billCount[0]?.totalAmount || 0,
            kpi: totalKPI,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


// thống kê bill

const billTotal = async (start, end) => {
    return await Bill.aggregate([
        { $match: { status: 2, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
};

const countBills = async (start, end) => {
    return await Bill.countDocuments({ status: 2, createdAt: { $gte: start, $lte: end } });
};

const transactionTotal = async (start, end) => {
    const transactions = await Transaction.aggregate([
        { 
            $match: { 
                status: { $nin: [1, 3] }, 
                createdAt: { $gte: start, $lte: end } 
            } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const bills = await billTotal(start, end);

    return (transactions[0]?.total || 0) - (bills[0]?.total || 0);
};

const getStatisticBill = async (req, res) => {
    try {
        let { day, month, year } = req.query;

        const today = new Date();

        day = day ? parseInt(day) : today.getDate();
        month = month ? parseInt(month) : today.getMonth() + 1;
        year = year ? parseInt(year) : today.getFullYear();

        const startOfDayVN = new Date(year, month - 1, day, 0, 0, 0);
        const endOfDayVN = new Date(year, month - 1, day, 23, 59, 59);
        const startOfDayUTC = new Date(startOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        const endOfDayUTC = new Date(endOfDayVN.getTime() - (7 * 60 * 60 * 1000));
        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(year, month, 1, 0, 0, 0);
        const startOfMonthUTC = new Date(startOfMonth.getTime() - (7 * 60 * 60 * 1000));
        const endOfMonthUTC = new Date(endOfMonth.getTime() - (7 * 60 * 60 * 1000));

        // ✅ Xác định tháng trước
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const startOfLastMonth = new Date(lastYear, lastMonth - 1, 1, 0, 0, 0);
        const endOfLastMonth = new Date(lastYear, lastMonth, 1, 0, 0, 0);

        const startOfLastMonthUTC = new Date(startOfLastMonth.getTime() - (7 * 60 * 60 * 1000));
        const endOfLastMonthUTC = new Date(endOfLastMonth.getTime() - (7 * 60 * 60 * 1000));

        const totalBillToday = await billTotal(startOfDayUTC, endOfDayUTC);
        const totalBillMonth = await billTotal(startOfMonthUTC, endOfMonthUTC);
        const totalBillLastMonth = await billTotal(startOfLastMonthUTC, endOfLastMonthUTC);

        const countBillToday = await countBills(startOfDayUTC, endOfDayUTC);
        const countBillMonth = await countBills(startOfMonthUTC, endOfMonthUTC);
        const countBillLastMonth = await countBills(startOfLastMonthUTC, endOfLastMonthUTC);

        const transactionDiffToday = await transactionTotal(startOfDayUTC, endOfDayUTC);
        const transactionDiffMonth = await transactionTotal(startOfMonthUTC, endOfMonthUTC);
        const transactionDiffLastMonth = await transactionTotal(startOfLastMonthUTC, endOfLastMonthUTC);

        return res.status(200).json({
            message: "Thống kê bill",
            date: `${day}-${month}-${year}`,
            totalBillToday: totalBillToday[0]? totalBillToday[0].total : 0,
            totalBillMonth: totalBillMonth[0]? totalBillMonth[0].total : 0,
            totalBillLastMonth: totalBillLastMonth[0]? totalBillLastMonth[0].total : 0,
            countBillToday,
            countBillMonth,
            countBillLastMonth,
            transactionDiffToday, 
            transactionDiffMonth,
            transactionDiffLastMonth
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}



module.exports = {
    getMonthlyStats,
    getDailyStats,
    getBalance,
    getStaffMonthlyStats,
    getDailyBankStatsByStaff,
    getTransactionStatsByStaff,
    listActiveBoxAmountByBank,
    listActiveBoxAmountByStaff,
    getStaffShareInMonth,
    getDailyShareOfStaff,
    getStatisticBill,
    getTotalTransaction
}