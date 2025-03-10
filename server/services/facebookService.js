const { Setting } = require("../models");
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
        console.log(accessToken)
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

        if (typeof response.data === "string" && response.data.includes("HTTP Code 400")) {
            return null;
        }

        if (typeof response.data === "string" && response.data.includes("cURL Error")) {
            return null;
        }

        return response.data;

    } catch (error) {
        return null;
    }
}

module.exports = {
    updateAccessToken,
    getFBInfo
}
