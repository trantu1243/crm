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
const { importExcelToMongo } = require('./dump');
const { resetPass } = require('./utils/resetPass');
const path = require('path');
const { seedPermissions } = require('./services/createrPermission.service');
const { verifySocketConnection } = require('./middlewares/validateSocket');
const { initSocket } = require('./socket/socketHandler');
const { Transaction, BoxTransaction, Bill, Setting, Staff, BankApi } = require('./models');
const { updateFlags, updateCustomer } = require('./services/updateFlags');
const { lockInactiveBoxes } = require('./services/boxTransaction.service');
const { getMessGroupInfo, getFBInfoTest } = require('./services/facebookService');

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connect to mongodb successfully");
    // importExcelToMongo();
    // seedPermissions();
    // resetPass();

    // updateFlag();
    // updateFlags()
    // updateCustomer()
    // getFBInfoTest()
    // updateFlag()
});

const updateFlag = async () =>{
    try {
        // const box = await BoxTransaction.findOne({messengerId: '9803203889745559'})
        // const bank = await BankApi.findOne({ bankCode: 'TCB'});
        // const staff = await Staff.findById('67bfedd29a7ee1fad78f1ee3');
        // await Bill.create({
        //     bankCode: 'TCB',
        //     stk: '19036016496011',
        //     content: 'Thanh khoan GDTG 490a9422',
        //     amount: 6000000,
        //     typeTransfer: 'seller',
        //     boxId: box._id,
        //     linkQr: `https://img.vietqr.io/image/${bank.binBank}-${'19036016496011'}-nCr4dtn.png?amount=${Number(6000000)}&addInfo=${'Thanh khoan GDTG 490a9422'}&accountName=`,
        //     status: 1,
        //     staffId: staff._id,
        //     createdAt: "2025-03-07T08:57:09.921Z",
        // });
        // const transactions = await Transaction.updateMany({ boxId: box._id, status: { $in: [ 6, 8] }}, {status: 7});

        await BoxTransaction.updateMany({}, {flag: 1});
        console.log('updated flag of box successfully')
        await Transaction.updateMany({}, {flag: 1});
        console.log('updated flag of transaction successfully')
        await Bill.updateMany({}, {flag: 1});
        console.log('updated flag of bill successfully')
    } catch (e) {
        console.log(e)
    }
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['https://thantai.tathanhan.com', 'http://localhost:3001', 'https://dev.tathanhan.com'], 
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

io.use(verifySocketConnection);

app.use(cors({
	origin: ['https://thantai.tathanhan.com', 'http://localhost:3001', 'https://dev.tathanhan.com'], 
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

