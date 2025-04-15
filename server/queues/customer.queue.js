const Queue = require("bull");
const { Customer, BoxTransaction, Transaction } = require("../models");

const redisHost = process.env.NODE_ENV === "production" ? "redis" : "127.0.0.1";
const redisPort = 6379;

const customerQueue = new Queue("customer", {
    redis: { host: redisHost, port: redisPort }
});

customerQueue.process(async (job) => {
    const { id } = job.data;
    try {

        const box = await BoxTransaction.findById(id);
        if (box && box.buyer) {
            const customer = await Customer.findById(box.buyer);
            if (!customer) {
                return { success: false, message: 'Customer not found' };
            }
    
            let boxTransactions = await BoxTransaction.find({ buyer: customer._id });
            let successTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 2 });
            let cancelTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 3 });
    
            customer.buyerCount.success = successTransactions.length;
            customer.buyerCount.cancel = cancelTransactions.length;
    
            boxTransactions = await BoxTransaction.find({ seller: customer._id });
            successTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 2 });
            cancelTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 3 });
    
            customer.sellerCount.success = successTransactions.length;
            customer.sellerCount.cancel = cancelTransactions.length;
    
            await customer.save();

        } 
        if (box && box.seller) {
            const customer = await Customer.findById(box.seller);
            if (!customer) {
                return { success: false, message: 'Customer not found' };
            }
    
            let boxTransactions = await BoxTransaction.find({ seller: customer._id });
            let successTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 2 });
            let cancelTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 3 });
    
            customer.sellerCount.success = successTransactions.length;
            customer.sellerCount.cancel = cancelTransactions.length;
    
            boxTransactions = await BoxTransaction.find({ buyer: customer._id });
            successTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 2 });
            cancelTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 3 });
    
            customer.buyerCount.success = successTransactions.length;
            customer.buyerCount.cancel = cancelTransactions.length;
    
            await customer.save();
        }
        
    } catch (error) {
        console.error("❌ Error processing customer queue:", error);
    }
});

module.exports = customerQueue;
