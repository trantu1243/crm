const { Setting, Customer, BoxTransaction } = require("../models");
const axios = require("axios");
const qs = require('qs');

async function getFacebookAccessToken(cookies, proxy, proxy_auth) {
    try {
        const data = qs.stringify({
            'cookie': cookies,
            'proxy': proxy,
            'proxy_auth': proxy_auth
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.tathanhan.com/gettoken.php',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios.request(config);
        return response.data.token;
    } catch (error) {
        console.error("Lỗi lấy Access Token:", error);
        return null;
    }
}

async function updateAccessToken() {
    try {
        const setting = await Setting.findOne({ uniqueId: 1 });

        if (!setting || !setting.cookie.status || !setting.cookie.value) {
            setting.cookie.value = '';
            setting.cookie.status = false;
            setting.accessToken.value = '';
            setting.accessToken.status = false;
            await setting.save();
            return;
        }

        const accessToken = await getFacebookAccessToken(setting.cookie.value, setting.proxy.proxy, setting.proxy.proxy_auth);
        if (accessToken) {
            setting.accessToken.value = accessToken;
            setting.accessToken.status = true;
        } else {
            setting.cookie.value = '';
            setting.cookie.status = false;
            setting.accessToken.value = '';
            setting.accessToken.status = false;
        }

        await setting.save();

        return setting;
    } catch (error) {
        console.error("Lỗi cập nhật access token:", error);
    } 
}

async function updateAccessToken1() {
    try {
        const setting = await Setting.findOne({ uniqueId: 1 });

        if (!setting || !setting.cookie1.status || !setting.cookie1.value) {
            setting.cookie1.value = '';
            setting.cookie1.status = false;
            setting.accessToken1.value = '';
            setting.accessToken1.status = false;
            await setting.save();
            return;
        }

        const accessToken = await getFacebookAccessToken(setting.cookie1.value, setting.proxy.proxy, setting.proxy.proxy_auth);
        if (accessToken) {
            setting.accessToken1.value = accessToken;
            setting.accessToken1.status = true;
        } else {
            setting.cookie1.value = '';
            setting.cookie1.status = false;
            setting.accessToken1.value = '';
            setting.accessToken1.status = false;
        }

        await setting.save();

        return setting;
    } catch (error) {
        console.error("Lỗi cập nhật access token:", error);
    } 
}

async function getFBInfo(accessToken, cookies, proxy, proxy_auth, id) {
    try {
        let data = qs.stringify({
            'cookie': cookies,
            'proxy': proxy,
            'proxy_auth': proxy_auth,
            'token': accessToken,
            'user_id': id
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.tathanhan.com/getInfo.php',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios.request(config);

        if (typeof response.data === "string" && response.data.includes("cURL Error")) {
            return null
        }

        if (typeof response.data === "string" && response.data.includes("HTTP Code 400")) {
            
            const jsonStartIndex = response.data.indexOf('{');
            const jsonString = response.data.substring(jsonStartIndex);
            const responseData = JSON.parse(jsonString);
            const errorCode = responseData?.error?.code;
            const subCode = responseData?.error?.error_subcode;
            if (errorCode == 190) {
                const setting = await updateAccessToken1();
                if (!setting.accessToken1.status || !setting.cookie1.status)  
                    return null

                data = qs.stringify({
                    'cookie': setting.cookie1.value,
                    'proxy': setting.proxy.proxy,
                    'proxy_auth': setting.proxy.proxy_auth,
                    'token': setting.accessToken1.value,
                    'user_id': id
                });

                config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://api.tathanhan.com/getInfo.php',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: data
                };
        
                response = await axios.request(config);
                if (typeof response.data === "string" && (response.data.includes("HTTP Code 400") || response.data.includes("cURL Error")))
                    return null;
            } else if (errorCode == 100 && subCode == 33){
                let customer = await Customer.findOne({facebookId: id});
                if (!customer) {
                    customer = await Customer.create({
                        facebookId: id,
                        nameCustomer: "Người dùng facebook",
                        avatar: "https://tathanhan.com/no-avatar.jpg"
                    })
                }
            } else return null 
        }

        return response.data;

    } catch (error) {
        return null;
    }
}

async function getMessGroupInfo(cookie, proxy, proxyAuth, token, messengerId, setting, box = null) {
    let data = qs.stringify({
        'cookie': cookie,
        'proxy': proxy,
        'proxy_auth': proxyAuth,
        'token': token,
        'message_id': messengerId
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.tathanhan.com/getTheard.php',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    try {
        let response = await axios.request(config);
        if (typeof response.data === "string" && response.data.includes("cURL Error")) {
            return []
        }

        if (typeof response.data === "string" && response.data.includes("HTTP Code 400") ) {
            const jsonStartIndex = response.data.indexOf('{');
            const jsonString = response.data.substring(jsonStartIndex);
            const responseData = JSON.parse(jsonString);
            const errorCode = responseData?.error?.code;

            if (errorCode == 190) {
                const setting = await updateAccessToken();
                if (!setting.accessToken.status || !setting.cookie.status)  
                    return [];

                data = qs.stringify({
                    'cookie': setting.cookie.value,
                    'proxy': setting.proxy.proxy,
                    'proxy_auth': setting.proxy.proxy_auth,
                    'token': setting.accessToken.value,
                    'message_id': messengerId
                });

                config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://api.tathanhan.com/getTheard.php',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: data
                };
                response = await axios.request(config);

                if (typeof response.data === "string" && (response.data.includes("HTTP Code 400") || response.data.includes("cURL Error")))
                    return [];
            } 
            // else if (errorCode == 100) {
            //     if (box) {
            //         box.isEncrypted = true;
            //         await box.save();
            //         return []
            //     }
            // } 
            else return []
        }

        let senderIds = response.data.senders.data.map(sender => sender.id);

        for (let value of senderIds) {

            if (value !== '100003277523201' && value !== '100004703820246') {

                const data = await getFBInfo(setting.accessToken1.value , setting.cookie1.value, proxy, proxyAuth, value)
                if (data) {
                    let customer = await Customer.findOne({facebookId: value});
                    if (!customer) {
                        customer = await Customer.create({
                            facebookId: data.id,
                            nameCustomer: data.name,
                            avatar: data.picture.data ? data.picture.data.url : "https://tathanhan.com/no-avatar.jpg"
                        })
                    } else {
                        customer.facebookId = data.id;
                        customer.nameCustomer = data.name;
                        customer.avatar = data.picture.data ? data.picture.data.url : "https://tathanhan.com/no-avatar.jpg"
                        await customer.save();
                    }
                }
            }
        }
        if (senderIds.length > 0) {
            if (box) {
                box.isEncrypted = false;
                await box.save();
            }
        }
        return senderIds;
    } catch (error) {
        console.error('Error fetching thread data:', error);
        return [];
    }
}

const getFBInfoTest = async () => {
    try{
        const customers = await Customer.find({});
        for (let customer of customers) {
            if (!customer.nameCustomer) {
                const result = await getFBInfo(
                    '',
                    '',
                    '',
                    '',
                    customer.facebookId
                )
                if (result) {
                    customer.nameCustomer = result.name;
                    customer.avatar = result.picture.data.url;
                    await customer.save();
                }
            }
        }
        console.log('complete 1')

        const result = await BoxTransaction.aggregate([
            {
                $unwind: "$senders" // Tách từng phần tử của mảng senders
            },
            {
                $group: { 
                    _id: null, 
                    allSenders: { $addToSet: "$senders" } // Gom senders thành 1 mảng duy nhất, loại bỏ trùng lặp
                }
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "allSenders",
                    foreignField: "facebookId",
                    as: "matchedCustomers"
                }
            },
            {
                $project: {
                    allSenders: 1,
                    matchedFacebookIds: "$matchedCustomers.facebookId" // Lấy danh sách facebookId của customers
                }
            },
            {
                $project: {
                    uniqueSenders: {
                        $setDifference: ["$allSenders", "$matchedFacebookIds"] // Loại bỏ các sender có trong danh sách facebookId
                    }
                }
            }
        ]);

        const ids = result[0]?.uniqueSenders || [];
        console.log(ids.length);

        for (const id of ids) {
            const result = await getFBInfo(
                '',
                '',
                '',
                '',
                id
            )
            if (result) {
                await Customer.create({
                    facebookId: result.id,
                    nameCustomer: result.name,
                    avatar: result.picture.data.url
                })
            }
        }

        console.log('complete 2')

    } catch (e) {
        console.log(e)
    }
    
    
}

module.exports = {
    updateAccessToken,
    getFBInfo,
    getMessGroupInfo,
    getFBInfoTest,
    updateAccessToken1
}
