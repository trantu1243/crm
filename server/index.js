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
const { resetPass } = require('./utils/resetPass');
const path = require('path');
const { seedPermissions } = require('./services/createrPermission.service');
const { verifySocketConnection } = require('./middlewares/validateSocket');
const { initSocket } = require('./socket/socketHandler');
const { Transaction, BoxTransaction, Bill, Setting, Staff, BankApi, Customer, BankAccount } = require('./models');
const { updateFlags, updateCustomer } = require('./services/updateFlags');
const { lockInactiveBoxes } = require('./services/boxTransaction.service');
const { getMessGroupInfo, getFBInfoTest } = require('./services/facebookService');
const { updateUser } = require('./services/updateUserInfo');
const axios = require('axios');
const fs = require('fs');

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connect to mongodb successfully");

    // seedPermissions();
    // resetPass();

    // updateFlags()
    // updateCustomer()
    // getFBInfoTest()
    updateFlag()
    // updateUser()
});

const updateFlag = async () =>{
    try {
        const response = await axios.get("https://api.vietqr.io/v2/banks");
        const banks = response.data.data;

        // Tạo thư mục imgs/banks nếu chưa có
        const dirPath = path.join(__dirname, 'imgs', 'banks');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Lặp qua danh sách ngân hàng để tải logo
        for (const bank of banks) {
            
            const bankApi = await BankApi.findOneAndUpdate({bankCode: bank.code}, { logo: `https://mayman.tathanhan.com/images/banks/${bank.code}.png`, name: bank.name})
            const bankAccount = await BankAccount.findOneAndUpdate({bankCode: bank.code}, { logo: `https://mayman.tathanhan.com/images/banks/${bank.code}.png`, name: bank.name})

            console.log(`✅ Đã tải logo: ${bank.name} - ${bank.code}`);
        }

        console.log('🎉 Tất cả logo đã được tải về thành công!');
    } catch (error) {
        console.error('❌ Lỗi khi tải logo:', error);
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

