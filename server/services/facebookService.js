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

            if (errorCode == 190) {
                const setting = await updateAccessToken();
                if (!setting.accessToken.status || !setting.cookie.status)  
                    return null

                data = qs.stringify({
                    'cookie': setting.cookie.value,
                    'proxy': setting.proxy.proxy,
                    'proxy_auth': setting.proxy.proxy_auth,
                    'token': setting.accessToken.value,
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
            } else return null 
        }

        return response.data;

    } catch (error) {
        return null;
    }
}

async function getMessGroupInfo(cookie, proxy, proxyAuth, token, messengerId, box = null) {
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
            } else if (errorCode == 100) {
                if (box) {
                    box.isEncrypted = true;
                    await box.save();
                    return []
                }
            } else return []
        }

        let senderIds = response.data.senders.data.map(sender => sender.id);

        for (let value of senderIds) {

            if (value !== '100003277523201' && value !== '100004703820246') {
                let customer = await Customer.findOne({facebookId: value});
                if (!customer) {
                    const data = await getFBInfo(token , cookie, proxy, proxyAuth, value)
            
                    if (data) {
                        if (!customer) {
                            customer = await Customer.create({
                                facebookId: data.id,
                                nameCustomer: data.name,
                                avatar: data.picture.data.url
                            })
                        } else {
                            customer.nameCustomer = data.name;
                            customer.avatar = data.picture.data.url;
                            await customer.save()
                        }
                    }
                }
                
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
                    'EAABsbCS1iHgBOy63lbVKbZBkUtOZCcy3ZAvd0Hhq2WpvxWaB7Hr4oem9jZCaC6GG0rks4U6GB2acbZBZCvVv917nQUVglZBYN1PXCdzRtq0fAcRaJHJZBmkwUAVVS1MXDC9Gru3ZBsvqSPnkVWPGNbQp3lx4w7CCEpLykGhQWZAIljXAMucaXWlOc0WTDJgwZDZD',
                    'c_user=100058731655639; xs=43%3AAwdLdJ9Ad6HAeg%3A2%3A1709656101%3A-1%3A6386%3A%3AAcXkREPFlOO_ylw9oriKGtR7GNevegZPlHlNQGRIvU65;',
                    '14.225.60.143:50000',
                    'MVN515491:xMsA5b5Q',
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
                'EAABsbCS1iHgBOy63lbVKbZBkUtOZCcy3ZAvd0Hhq2WpvxWaB7Hr4oem9jZCaC6GG0rks4U6GB2acbZBZCvVv917nQUVglZBYN1PXCdzRtq0fAcRaJHJZBmkwUAVVS1MXDC9Gru3ZBsvqSPnkVWPGNbQp3lx4w7CCEpLykGhQWZAIljXAMucaXWlOc0WTDJgwZDZD',
                'c_user=100058731655639; xs=43%3AAwdLdJ9Ad6HAeg%3A2%3A1709656101%3A-1%3A6386%3A%3AAcXkREPFlOO_ylw9oriKGtR7GNevegZPlHlNQGRIvU65;',
                '14.225.60.143:50000',
                'MVN515491:xMsA5b5Q',
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
    getFBInfoTest
}
