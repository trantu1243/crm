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

    // updateCookie()

});

const updateCookie = async () =>{
    try {
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

