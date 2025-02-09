const { Staff } = require("../models")
const bcrypt = require("bcryptjs");

const resetPass = async () => {
    try{
        const staffs = await Staff.find();
        for (const staff of staffs) {
            staff.password = await bcrypt.hash('Hihi123@', 10);
            await staff.save();
        }
        console.log('reset password successfully');
    }
    catch ( error ) {
        console.log(error)
    }
    

}

module.exports = {
    resetPass
}