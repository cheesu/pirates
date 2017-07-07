import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Fcm = new Schema({
    endpoint:String,
    keys:Object(),
});



export default mongoose.model('fcm', Fcm);
