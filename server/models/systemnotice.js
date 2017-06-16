import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Systemnotice = new Schema({
    text: String,
});



export default mongoose.model('systemnotice', Systemnotice);
