const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();
// const { CronJob } = require('cron');

const routes = require('./routes/index');
const { importExcelToMongo } = require('./dump');
const { resetPass } = require('./utils/resetPass');
const path = require('path');
const { seedPermissions } = require('./services/createrPermission.service');
const { verifySocketConnection } = require('./middlewares/validateSocket');
const { initSocket } = require('./socket/socketHandler');
const { Transaction, BoxTransaction, Bill, Setting } = require('./models');
const { updateFlags } = require('./services/updateFlags');
const { lockInactiveBoxes } = require('./services/boxTransaction.service');

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connect to mongodb successfully");
    // importExcelToMongo();
    // seedPermissions();
    // resetPass();

    // updateFlag();
    // updateFlags()
    // updateSetting()
    // updateSetting()
});

const updateSetting = async () =>{
    try {
        // const setting = await Setting.findOneAndUpdate({uniqueId: 1}, {cookie: {value: '', status: false}, accessToken: {value: '', status: false}, uuidFbs: []});
        // console.log(setting);
        await BoxTransaction.findByIdAndUpdate('67cb29451e53f873cca9e9a4', {status: "complete"})
    } catch (e) {
        console.log(e)
    }
}

const updateFlag = async () =>{
    try {
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

// const job = new CronJob(
// 	'0 3 * * *', 
// 	async () => {
// 		const setting = await Setting.findOne({uniqueId: 1});
//         if (setting && setting.lockBox.isOn) {
//             await lockInactiveBoxes(setting.lockBox.numOfDay)
//         }
// 	}, 
// 	null, 
// 	true, 
//     'Asia/Ho_Chi_Minh'
// );

