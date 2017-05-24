import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

const Account = new Schema({
    username: String,
    password: String,
    job:String,
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
