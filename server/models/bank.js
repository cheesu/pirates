import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Bank = new Schema({
    name: String,
    bank: String,
    item: String,
    userid:String,
});



export default mongoose.model('bank', Bank);
