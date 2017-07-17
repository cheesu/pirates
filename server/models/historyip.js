import mongoose from 'mongoose';

const Schema = mongoose.Schema;
 
const Historyip = new Schema({
    username:String,
    ip:String,
    created: { type: Date, default: Date.now }
});



export default mongoose.model('historyip', Historyip);
