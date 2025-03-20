import React, { useCallback, useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import Loader from "react-loaders";
import { Button, FormText } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

const QRCodeComponent = ({ encodedData, logo, data, style }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [imageCopied, setImageCopied] = useState(false);
    const qrRef = useRef(null);
    const canvasRef = useRef(null);
    const qrCode = useRef(
        new QRCodeStyling({
            type: "canvas",
            shape: "square",
            width: 518,
            height: 518,
            data: encodedData,
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
        })
    );

    const drawLogo = useCallback(() => {
        setIsLoading(false);
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const qrCanvas = qrRef.current.querySelector("canvas");
        if (!qrCanvas) return;

        ctx.drawImage(qrCanvas, 41, 81, 518, 518);

        ctx.strokeStyle = "#F0C55E";
        ctx.lineWidth = 2;
        ctx.strokeRect(35, 75, 530, 530);

        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = logo;
        logoImg.onload = () => {
            const logoWidth = 238;
            const logoHeight = 89;
           
            ctx.drawImage(logoImg, 0, -15, logoWidth, logoHeight);
        };

        ctx.strokeStyle = "#F0C55E";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(243, 20);
        ctx.lineTo(243, 55);
        ctx.stroke();

        ctx.fillStyle = "#153070";
        ctx.font = "bold 30px Tahoma";
        ctx.textAlign = "center";
        ctx.fillText("GDTG - Tạ Thanh An", 415, 50);

        if (data.amount) {
            ctx.fillStyle = "#204CB4";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                `Số tiền: ${new Intl.NumberFormat("en-US").format(data.amount)} VND`,
                310,
                632
            );
        }
        if (data.content) {
            ctx.fillStyle = "#204CB4";
            ctx.font = "22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Nội dung: ${data.content}`, 310, 659);
        }
        if (data.bankAccount) {
            ctx.fillStyle = "#204CB4";
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Số TK: ${data.bankAccount}`, 310, 686);
        }
        if (data.bankAccountName) {
            ctx.fillStyle = "#204CB4";
            ctx.font = "22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Chủ TK: ${data.bankAccountName}`, 310, 713);
        }
        if (data.checkCode) {
            ctx.fillStyle = "#204CB4";
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Mã check: ${data.checkCode}`, 310, 740);
            ctx.fillStyle = "#204CB4";
            ctx.font = "22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Check tại https://check.tathanhan.com`, 310, 767);
        }
    }, [data, logo]);

    useEffect(() => {
        if (qrRef.current) {
            qrCode.current.append(qrRef.current);
            setTimeout(drawLogo, 3000);
        }
    }, [encodedData, drawLogo]);

    const copyToClipboard = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return alert("Canvas chưa sẵn sàng!");
    
        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob }),
                ]);
                setImageCopied(true);
            } catch (err) {
                console.error("Lỗi sao chép ảnh:", err);
                alert("Không thể sao chép ảnh. Vui lòng thử lại!");
            }
        }, "image/png");
    };

    return (<>
        <div style={{ textAlign: "center" }}>
           {isLoading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div> 
            ) : (
                <canvas 
                    ref={canvasRef} 
                    width={600} height={776} 
                    style={{ ...style, cursor: 'pointer' }}
                    onClick={copyToClipboard}
                ></canvas>
            )}
            <div ref={qrRef} style={{ display: "none" }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%"}}>
            <Button color="link" onClick={copyToClipboard}>
                <FontAwesomeIcon icon={faCopy} color="#545cd8" size="lg" />
            </Button>
        </div>
        {imageCopied && (
            <div className="text-center" style={{width: '100%'}}>
                <FormText color="success">Image has been copied.</FormText>
            </div>
        )}
    </>);
};

export default QRCodeComponent;
