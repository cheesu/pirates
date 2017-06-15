import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

const Account = new Schema({
    username: String,
    password: String,
    job:String,
    lv:Number(),
    exp:Number(),
    max_hp:Number(),
    max_mp:Number(),
    hp:Number(),
    mp:Number(),
    str:Number(),
    int:Number(),
    dex:Number(),
    gold:Number(),
    item:Array(),
    mount:Object(),
    created: { type: Date, default: Date.now }
});

// bcryptjs 를 이용한 보안.
// generates hash
Account.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, 8);
};
// compares the password
Account.methods.validateHash = function(password) {
    return bcrypt.compareSync(password, this.password);
};

export default mongoose.model('account', Account);
