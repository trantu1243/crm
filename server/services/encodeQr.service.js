// Hàm tính CRC16-CCITT cho chuỗi đầu vào
function crc16(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
            crc &= 0xffff;
        }
    }
    return crc.toString(16).padStart(4, "0").toUpperCase();
}
  
  // Hàm hỗ trợ: thêm số 0 để đảm bảo chuỗi có độ dài 2 ký tự
function pad2zero(num) {
    return num.toString().padStart(2, "0");
}
  
/**
 * Tạo nội dung mã VietQR dựa trên đầu vào
 * @param {Object} input - Đối tượng đầu vào với các thuộc tính:
 *    bankId: string - Mã ngân hàng
 *    accountId: string - Số tài khoản hoặc mã định danh người thụ hưởng
 *    amount: number (optional) - Số tiền giao dịch
 *    description: string (optional) - Nội dung giao dịch
 * @returns {string} Chuỗi mã VietQR hoàn chỉnh
 */
function makeVietQRContent(input) {
    let v = "000201010211";
    const bankId = input.bankId;
    const accountId = input.accountId;
    const bankIdLen = bankId.length;
    const accountIdLen = accountId.length;
  
    // Field 38: Merchant Account Information
    // Tổng độ dài = độ dài bankId + độ dài accountId + 38 (theo quy định)
    const total_len = bankIdLen + accountIdLen + 38;
    v += "38" + pad2zero(total_len);
    v += "0010A000000727"; // GUID cố định của NAPAS
    // Subfield trong Merchant Account Information:
    // Tổng độ dài subfield = độ dài bankId + độ dài accountId + 8
    const sub_len = bankIdLen + accountIdLen + 8;
    v += "01" + pad2zero(sub_len);
    // Subfield "00": chứa bankId
    v += "00" + pad2zero(bankIdLen) + bankId;
    // Subfield "01": chứa accountId
    v += "01" + pad2zero(accountIdLen) + accountId;
  
    // Mã dịch vụ chuyển tiền nhanh (đến tài khoản)
    v += "0208QRIBFTTA";
    // Mã tiền tệ (ID "53"): 704 cho VND, được mã hoá với độ dài "03"
    v += "5303704";
  
    // Số tiền giao dịch (ID "54"), nếu có
    if (input.amount) {
        const amountStr = input.amount.toString();
        v += "54" + pad2zero(amountStr.length) + amountStr;
    }
    
    // Mã quốc gia (ID "58"): VN
    v += "5802VN";
  
    // Thông tin bổ sung (ID "62"), nếu có: ví dụ là nội dung giao dịch
    if (input.description) {
            const desc = input.description;
            // Lưu ý: độ dài của phần giá trị được tính là độ dài của chuỗi desc cộng 4 (theo định dạng)
            v += "62" + pad2zero(desc.length + 4) + "08" + pad2zero(desc.length) + desc;
    }
  
    // Thêm ID của CRC (ID "63") với độ dài cố định là "04"
    v += "6304";
    // Tính checksum CRC16-CCITT cho toàn bộ chuỗi vừa tạo (bao gồm "6304")
    v += crc16(v);
    return v;
}

// Ví dụ sử dụng: Tạo mã VietQR cho VPBank
const inputVPBank = {
    bankId: "970432",          // Mã ngân hàng VPBank
    accountId: "0586593333",    // Số tài khoản
    amount: 200000,             // Số tiền 200,000 VNĐ
    description: "test qrcode vpbank" // Nội dung giao dịch
};

module.exports = {
    makeVietQRContent
}