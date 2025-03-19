const { QRCodeStyling } = require("qr-code-styling-node/lib/qr-code-styling.common.js");
const nodeCanvas = require("canvas");
const { createCanvas, loadImage } = require("canvas");
const { makeVietQRContent } = require("./encodeQr.service");

const data = {
    bankName: "MBBank",
    bankAccount: "0586593333",
    bankAccountName: "Tạ Thanh An",
    binBank: "970432",
    content: 'test'
};

const generateQr = async (data) => {
    let input = {};
    if (data.binBank) input.bankId = data.binBank;
    if (data.bankAccount) input.accountId = data.bankAccount;
    if (data.amount) input.amount = data.amount;
    if (data.content) input.description = data.content;
    const text = makeVietQRContent(input)
    const options = {
        type: "canvas",
        shape: "square",
        width: 518,
        height: 518,
        data: text,
        margin: 0,
        qrOptions: {
            typeNumber: "0",
            mode: "Byte",
            errorCorrectionLevel: "Q",
        },
        imageOptions: {
            saveAsBlob: true,
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 0,
        },
        dotsOptions: {
            type: "classy-rounded",
            color: "#e65151",
            roundSize: true,
            gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
                { offset: 0, color: "#1C892E" },
                { offset: 1, color: "#104E1A" },
            ],
            },
        },
        backgroundOptions: {
            round: 0,
            color: "#ffffff",
            gradient: null,
        },
        image: "https://mayman.tathanhan.com/images/logo/qr-img.png",
        cornersSquareOptions: {
            type: "dot",
            color: "#ECAC16",
            gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
                { offset: 0, color: "#FCB206" },
                { offset: 1, color: "#CC961A" },
            ],
            },
        },
        cornersDotOptions: {
            type: "",
            color: "#ECAC16",
            gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
                { offset: 0, color: "#FCB206" },
                { offset: 1, color: "#CC961A" },
            ],
            },
        },
    };

    const qrCodeImage = new QRCodeStyling({
        nodeCanvas, 
        ...options
    });
    
    try {
        const buffer = await qrCodeImage.getRawData("png");
        const qrImage = await loadImage(buffer);
        const logoImage = await loadImage("https://mayman.tathanhan.com/images/banks/TCB.png");

        const height = data.mode === 'full' ? 776 : 670;
        const canvas = createCanvas(600, height);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height); 

        ctx.drawImage(qrImage, 41, 75, 518, 518);

        ctx.strokeStyle = "#F0C55E";
        ctx.lineWidth = 2;
        ctx.strokeRect(37, 71, 526, 526);

        const logoWidth = 268;
        const logoHeight = 100;
        const logoX = (canvas.width - logoWidth) / 2;
        const logoY = 670;

        ctx.drawImage(logoImage, 0, -15, logoWidth, logoHeight);

        ctx.strokeStyle = "#F0C55E";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(253, 25);
        ctx.lineTo(253, 65);
        ctx.stroke();

        ctx.fillStyle = "#153070";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GDTG - Tạ Thanh An", 430, 55);

        if (data.amount && data.mode === 'full') {
            ctx.fillStyle = "#204CB4";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
            `Số tiền: ${new Intl.NumberFormat("en-US").format(data.amount)} VND`,
            310,
            620
            );
        }
        if (data.content && data.mode === 'full') {
            ctx.fillStyle = "#204CB4";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Nội dung: ${data.content}`, 310, 660);
        }
        if (data.bankAccount && data.mode === 'full') {
            ctx.fillStyle = "#204CB4";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Số TK: ${data.bankAccount}`, 310, 690);
        }
        if (data.bankAccountName && data.mode === 'full') {
            ctx.fillStyle = "#204CB4";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Chủ TK: ${data.bankAccountName}`, 310, 720);
        }
        if (data.checkCode && data.mode === 'full') {
            ctx.fillStyle = "#204CB4";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Mã check: ${data.checkCode}`, 310, 750);
            ctx.fillStyle = "#204CB4";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Check tại https://check.tathanhan.com`, 310, 780);
        }
        const base64Image = canvas.toDataURL("image/png"); 
        return base64Image;
    } catch (error) {
        console.error(error);
        return '';
    }
}

module.exports = {
    generateQr
}
