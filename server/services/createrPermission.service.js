const { Permission } = require("../models");

// Danh sách quyền cần tạo
const permissions = [
    { name: "Ghi chú", slug: "note", status: "active" },
    { name: "Tạo giao dịch", slug: "create-transaction", status: "active" },
    { name: "Tạo thanh khoản", slug: "create-bill", status: "active" },
    { name: "Khoá box", slug: "lock-box", status: "active" },
    { name: "Mở box", slug: "unlock-box", status: "active" }
];

// Hàm thêm quyền vào database
const seedPermissions = async () => {
    try {
        await Permission.deleteMany({});
        for (const perm of permissions) {
            const exists = await Permission.findOne({ slug: perm.slug });
            if (!exists) {
                await Permission.create(perm);
                console.log(`✅ Đã tạo quyền: ${perm.name}`);
            } else {
                console.log(`⚠️ Quyền '${perm.name}' đã tồn tại, bỏ qua.`);
            }
        }
        console.log("🚀 Hoàn thành việc thêm quyền!");
    } catch (error) {
        console.error("❌ Lỗi khi tạo quyền:", error);
    }
};

module.exports = {
    seedPermissions
}