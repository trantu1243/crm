const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();
const { CronJob } = require('cron');

const routes = require('./routes/index');
const path = require('path');
const { verifySocketConnection } = require('./middlewares/validateSocket');
const { initSocket } = require('./socket/socketHandler');
const { Transaction, BoxTransaction, Bill, Setting, Staff, BankApi, Customer, BankAccount, Cookie, Tag } = require('./models');
const { lockInactiveBoxes } = require('./services/boxTransaction.service');
const { updateCustomerBankAccounts, updateCustomers } = require('./services/customer.service');

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connect to mongodb successfully");

    updateCookie()
    // updateCustomerBankAccounts();
    // updateCustomers();
});

const updateCookie = async () =>{
    try {
        // 67c04fd2c13762df11aee5f7
        // 67c04fd2c13762df11aee5f5
        // 67c04fc0c13762df11aee5d3
        // 67c04f99c13762df11aee595
        // 67c04f99c13762df11aee593

        // 67c04b2a9898c1ea687f2553
        // 67c04b2a9898c1ea687f2551
        // 67c04b199898c1ea687f2531
        // 67c04b199898c1ea687f252f
        // 67c04b089898c1ea687f250f
        // 67c04b089898c1ea687f250d
        // 67c04af79898c1ea687f24ed
        // 67c04af79898c1ea687f24eb
        // 67c04ae09898c1ea687f24cb
        // 67c04ae09898c1ea687f24c9

        // 67c04ac29898c1ea687f24a4
        // 67c04ac19898c1ea687f24a2
        // 67c04ab39898c1ea687f2480
        // 67c04a9f9898c1ea687f245e
        // 67c04a8f9898c1ea687f243e
        // 67c04a8f9898c1ea687f243c
        // 67c04a809898c1ea687f241c
        // 67c04a809898c1ea687f241a
        // 67c04a719898c1ea687f23fa
        // 67bff00f0866df4cb7a3bffd

        await Customer.findByIdAndDelete('67c04fd2c13762df11aee5f7');
        await Customer.findByIdAndDelete('67c04fd2c13762df11aee5f5');
        await Customer.findByIdAndDelete('67c04fc0c13762df11aee5d3');
        await Customer.findByIdAndDelete('67c04f99c13762df11aee595');
        await Customer.findByIdAndDelete('67c04f99c13762df11aee593');

        await Customer.findByIdAndDelete('67c04b2a9898c1ea687f2553');
        await Customer.findByIdAndDelete('67c04b2a9898c1ea687f2551');
        await Customer.findByIdAndDelete('67c04b199898c1ea687f2531');
        await Customer.findByIdAndDelete('67c04b199898c1ea687f252f');
        await Customer.findByIdAndDelete('67c04b089898c1ea687f250f');
        await Customer.findByIdAndDelete('67c04b089898c1ea687f250d');
        await Customer.findByIdAndDelete('67c04af79898c1ea687f24ed');
        await Customer.findByIdAndDelete('67c04af79898c1ea687f24eb');
        await Customer.findByIdAndDelete('67c04ae09898c1ea687f24cb');
        await Customer.findByIdAndDelete('67c04ae09898c1ea687f24c9');

        await Customer.findByIdAndDelete('67c04ac29898c1ea687f24a4');
        await Customer.findByIdAndDelete('67c04ac19898c1ea687f24a2');
        await Customer.findByIdAndDelete('67c04ab39898c1ea687f2480');
        await Customer.findByIdAndDelete('67c04a9f9898c1ea687f245e');
        await Customer.findByIdAndDelete('67c04a8f9898c1ea687f243e');
        await Customer.findByIdAndDelete('67c04a8f9898c1ea687f243c');
        await Customer.findByIdAndDelete('67c04a809898c1ea687f241c');
        await Customer.findByIdAndDelete('67c04a809898c1ea687f241a');
        await Customer.findByIdAndDelete('67c04a719898c1ea687f23fa');
        await Customer.findByIdAndDelete('67bff00f0866df4cb7a3bffd');
    } catch (error) {
        console.error(error);
    }
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['https://thantai.tathanhan.com', 'http://localhost:3001', 'https://dev.tathanhan.com', 'https://thantai.tathanhan.vn'], 
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

io.use(verifySocketConnection);

app.use(cors({
	origin: ['https://thantai.tathanhan.com', 'http://localhost:3001', 'https://dev.tathanhan.com', 'https://thantai.tathanhan.vn'], 
	methods: ['GET', 'POST', 'PUT', 'DELETE'], 
	allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use((req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "imgs")));

app.use(mongoSanitize());
app.use('/v1', routes);

initSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const job = new CronJob(
	'0 4 * * *', 
	async () => {
		const setting = await Setting.findOne({uniqueId: 1});
        if (setting && setting.lockBox.isOn) {
            await lockInactiveBoxes(setting.lockBox.numOfDay);
            await Bill.deleteMany({ status: 3});
        }
	}, 
	null, 
	true, 
    'Asia/Ho_Chi_Minh'
);

