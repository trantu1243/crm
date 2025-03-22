const { Setting, FeeTransaction, Customer, Staff } = require("../models");
const { updateAccessToken, getFBInfo, updateAccessToken1 } = require("../services/facebookService");
const { getPermissions } = require("../services/permission.service");

  
const getSetting = async (req, res) => {
    try {
        const setting = await Setting.findOne({uniqueId: 1}).select('fee');

        res.status(200).json({
            message: 'setting fetched successfully',
            data: setting,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getSettings = async (req, res) => {
    try {
        const setting = await Setting.findOne({uniqueId: 1}).populate(
            [
                { path: 'uuidFbs', select: 'nameCustomer facebookId avatar username' },
            ]
        );;
        
        res.status(200).json({
            message: 'setting fetched successfully',
            data: setting,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateSettings = async (req, res) => {
    try {
        const { lockBox, cookie, accessToken, uuidFbs, proxy, proxy_auth, numOfDay, isOn } = req.body;
        
        let setting = await Setting.findOne({ uniqueId: 1 });

        if (!setting) {
            setting = new Setting({ uniqueId: 1 });
        }

        if (typeof lockBox !== "undefined") {
            setting.lockBox = lockBox;
        }

        if (typeof cookie !== "undefined") {
            if (cookie.trim() === "") {
                setting.cookie = { value: "", status: false }; 
            } else {
                setting.cookie = { value: cookie, status: true };
            }
        }

        if (typeof proxy !== "undefined") {
            setting.proxy.proxy = proxy;
        }

        if (typeof proxy_auth !== "undefined") {
            setting.proxy.proxy_auth = proxy_auth;
        }

        if (typeof accessToken !== "undefined" && accessToken !== '') {
            setting.accessToken = {
                value: accessToken,
                status: accessToken.trim() !== ""
            };
        }

        if (typeof uuidFbs !== "undefined") {
            setting.uuidFbs = uuidFbs;
        }

        if (typeof numOfDay !== "undefined") {
            setting.lockBox.numOfDay = numOfDay;
        }

        if (typeof isOn !== "undefined") {
            setting.lockBox.isOn = isOn;
        }

        await setting.save();

        res.status(200).json({
            message: "Setting updated successfully",
            data: setting,
        });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const toggleFeeSetting = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const setting = await Setting.findOne({uniqueId: 1});

        if (setting.fee.isOn) {
            await FeeTransaction.updateMany({}, { $inc: { feeDefault: -1 * setting.fee.amount } });
        } else {
            await FeeTransaction.updateMany({}, { $inc: { feeDefault: Number(amount) } });
        }
        
        setting.fee.amount = Number(amount);
        setting.fee.isOn = ! setting.fee.isOn;
        await setting.save();

        res.status(200).json({
            message: 'setting updated successfully',
            data: setting,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getToken = async (req, res) => {
    try {
        const permissions = await getPermissions(req.user.id);
        const user = await Staff.findById(req.user.id);
        
        if (!permissions.some(permission => permission.slug === 'edit-cookie') && user.is_admin !== 1) {
            return res.status(400).json({ message: `Không đủ quyền` });
        }

        const { cookie, proxy, proxy_auth } = req.body;

        const setting = await Setting.findOne({uniqueId: 1});

        if (!setting) {
            return res.status(404).json({ message: "Không tìm thấy cài đặt" });
        }
        if (typeof cookie !== "undefined") {
            if (cookie.trim() === "") {
                setting.cookie = { value: '', status: false }; 
            } else {
                setting.cookie = { value: cookie, status: true };
            }
        }

        if (typeof proxy !== "undefined") {
            setting.proxy.proxy = proxy;
        }

        if (typeof proxy_auth !== "undefined") {
            setting.proxy.proxy_auth = proxy_auth;
        }
        await setting.save();

        if (!setting.proxy.proxy || !setting.proxy.proxy_auth) {
            return res.status(400).json({ message: "Thiếu proxy!" });
        }

        const updatedSetting = await updateAccessToken();

        if (!updatedSetting || !updatedSetting.accessToken.value) {
            return res.status(500).json({ message: "Không lấy được access token!" });
        }

        res.status(200).json({
            message: "Cập nhật token thành công!",
            accessToken: updatedSetting.accessToken.value
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getToken1 = async (req, res) => {
    try {
        const permissions = await getPermissions(req.user.id);
        const user = await Staff.findById(req.user.id);
        
        if (!permissions.some(permission => permission.slug === 'edit-cookie') && user.is_admin !==1) {
            return res.status(400).json({ message: `Không đủ quyền` });
        }

        const { cookie, proxy, proxy_auth } = req.body;

        const setting = await Setting.findOne({uniqueId: 1});

        if (!setting) {
            return res.status(404).json({ message: "Không tìm thấy cài đặt" });
        }
        if (typeof cookie !== "undefined") {
            if (cookie.trim() === "") {
                setting.cookie1 = { value: '', status: false }; 
            } else {
                setting.cookie1 = { value: cookie, status: true };
            }
        }

        if (typeof proxy !== "undefined") {
            setting.proxy.proxy = proxy;
        }

        if (typeof proxy_auth !== "undefined") {
            setting.proxy.proxy_auth = proxy_auth;
        }
        await setting.save();

        if (!setting.proxy.proxy || !setting.proxy.proxy_auth) {
            return res.status(400).json({ message: "Thiếu proxy!" });
        }

        const updatedSetting = await updateAccessToken1();

        if (!updatedSetting || !updatedSetting.accessToken.value) {
            return res.status(500).json({ message: "Không lấy được access token!" });
        }

        res.status(200).json({
            message: "Cập nhật token thành công!",
            accessToken: updatedSetting.accessToken.value
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addGDTGAccount = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: `Chưa nhập id` });

        const setting = await Setting.findOne({uniqueId: 1});

        if (!setting.accessToken1.status || !setting.cookie1.status || !setting.proxy.proxy || !setting.proxy.proxy_auth) {
            return res.status(400).json({ message: "Không thể thêm vì thiếu setting" });
        }

        const data = await getFBInfo(setting.accessToken1.value , setting.cookie1.value, setting.proxy.proxy, setting.proxy.proxy_auth, id)
        if (data === null){
            return res.status(400).json({ message: "Không thể lấy được thông tin user" });
        }
        let customer = await Customer.findOne({facebookId: id});
        if (customer) {
            customer.nameCustomer = data.name;
            customer.avatar = data.picture.data.url;
            await customer.save()
        } else {
            customer = await Customer.create({
                facebookId: data.id,
                nameCustomer: data.name,
                avatar: data.picture.data.url
            })
        }
        await Setting.updateOne(
            { uniqueId: 1 },
            { $addToSet: { uuidFbs: customer._id } } 
        );

        return res.json({ 
            status: true,
            message: 'Add id success',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const removeGDTGAccount = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: `Chưa nhập id` });

        const setting = await Setting.findOne({ uniqueId: 1 });

        if (!setting) return res.status(404).json({ message: "Không tìm thấy setting" });

        let customer = await Customer.findOne({facebookId: id});
        if (!customer) {
            return res.status(404).json({ message: "Không tìm thấy id" });
        }

        await Setting.updateOne(
            { uniqueId: 1 },
            { $pull: { uuidFbs: customer._id } }
        );

        return res.json({
            status: true,
            message: "Remove ID success",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const editGDTGAccount = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: `Chưa nhập id` });

        const { facebookId, nameCustomer, username } = req.body;
        console.log(req.body)

        let customer = await Customer.findById(id);
        if (!customer) return res.status(400).json({ message: `Chưa nhập id` });
       
        if (facebookId) customer.facebookId = facebookId;
        if (nameCustomer) customer.nameCustomer = nameCustomer;
        if (username) customer.username = username;

        const setting = await Setting.findOne({uniqueId: 1});

        if (!setting.accessToken1.status || !setting.cookie1.status || !setting.proxy.proxy || !setting.proxy.proxy_auth) {
            return res.status(400).json({ message: "Không thể thêm vì thiếu setting" });
        }

        const data = await getFBInfo(setting.accessToken1.value , setting.cookie1.value, setting.proxy.proxy, setting.proxy.proxy_auth, facebookId)
        if (data === null){
            return res.status(400).json({ message: "Không thể lấy được thông tin user" });
        }
        
        customer.nameCustomer = data.name;
        customer.avatar = data.picture.data.url;
        
        await customer.save();

        console.log(customer)
        return res.json({ 
            status: true,
            message: 'Edit customer successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { 
    getSetting,
    toggleFeeSetting,
    getSettings,
    updateSettings,
    getToken, 
    addGDTGAccount,
    removeGDTGAccount,
    getToken1,
    editGDTGAccount
};
