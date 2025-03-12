const { Transaction, BoxTransaction, Bill, Setting } = require('../models');
const { getMessGroupInfo } = require('./facebookService');


const checkAndUpdateConsecutiveSums = async (transactions, bills, box) => {
    // Tính mảng tổng tích lũy cho transactions
    const transSums = [];
    let transTotal = 0;
    for (const trans of transactions) {
        transTotal += trans.amount || 0;
        transSums.push(transTotal);
    }

    // Tính mảng tổng tích lũy cho bills
    const billsSums = [];
    let billsTotal = 0;
    for (const bill of bills) {
        billsTotal += bill.amount || 0;
        billsSums.push(billsTotal);
    }

    // Tìm tổng khớp đầu tiên
    let tranI = 0;
    let billI = 0;
    for (let i = 0; i < transSums.length; i++) {
        const transSum = transSums[i];
        const billIndex = billsSums.indexOf(transSum);
        
        if (billIndex !== -1) {
            // Lấy số lượng transactions và bills cần cập nhật
            const transCount = i + 1 ;
            const billCount = billIndex + 1 ;

            // Cập nhật transactions
            const transToUpdate = transactions.slice(tranI, transCount);
            const transIds = transToUpdate.map(t => t._id);
            await Transaction.updateMany(
                { _id: { $in: transIds } },
                { 
                    $set: { 
                        status: 2,
                        flag: box.flag 
                    }
                }
            );

            // Cập nhật bills
            const billsToUpdate = bills.slice(billI, billCount);
            const billIds = billsToUpdate.map(b => b._id);
            await Bill.updateMany(
                { _id: { $in: billIds } },
                { 
                    $set: { 
                        flag: box.flag 
                    }
                }
            );

            box.flag += 1;
            tranI = transCount;
            billI = billCount;
           
        } else {
            if (i === transSums.length - 1) {
                const transToUpdate = transactions.slice(tranI, transSums.length);
                const transIds = transToUpdate.map(t => t._id);
                await Transaction.updateMany(
                    { _id: { $in: transIds } },
                    { 
                        $set: { 
                            flag: box.flag 
                        }
                    }
                );

                if (billI < billsSums.length) {
                    const billsToUpdate = bills.slice(billI, billsSums.length);
                    const billIds = billsToUpdate.map(b => b._id);
                    await Bill.updateMany(
                        { _id: { $in: billIds } },
                        { 
                            $set: { 
                                flag: box.flag 
                            }
                        }
                    );
                }
                
            } 
        }
    }

    return box.flag;
};

const updateFlags = async () => {

    const boxes = await BoxTransaction.find({}).sort({createdAt: -1});

    let i = 1;

    for (const box of boxes) {
        box.flag = 1;
        const transactions = await Transaction.find({ boxId: box._id, status: { $nin: [3, 1, 6] } }).sort({createdAt: 1});

        const bills = await Bill.find({ boxId: box._id, status: { $nin: [3, 1] } }).sort({createdAt: 1});

        if (transactions.length && bills.length) {
            const result = await checkAndUpdateConsecutiveSums(transactions, bills, box);
        
            box.flag = result;

            if (box.amount === 0) box.flag-=1;
            await box.save();

            await Transaction.updateMany({ boxId: box._id, status: { $in: [3, 1, 6] } }, {flag: box.flag})
            await Bill.updateMany({ boxId: box._id, status: { $in: [3, 1] } }, {flag: box.flag})

        }
    
       
        if (i % 100 === 0) console.log(i)
        i++;
    }

    
}

const updateCustomer = async () =>{
    try {
        const setting = await Setting.findOne({uniqueId: 1});
        const boxes = await BoxTransaction.find({}).sort({createdAt: -1});
        let i = boxes.length;
        console.log(i)
        for (const box of boxes) {
            if (i < 63100 && setting.accessToken.status && setting.cookie.status && setting.proxy.proxy && setting.proxy.proxy_auth) {
                const senders = await getMessGroupInfo(setting.cookie.value, setting.proxy.proxy, setting.proxy.proxy_auth, setting.accessToken.value, box.messengerId, box)
                
                if (senders.length > 0) {
                    box.senders = senders;
                    await box.save();
                }
            }
            console.log(i);
            i--;
        }

    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    updateFlags,
    updateCustomer
}