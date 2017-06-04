import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Monster = new Schema({
    name: String,
    lv: Number(),
    lv:Number(),
    hp:Number(),
    mp:Number(),
    ap:Number(),
    dp:Number(),
    speed:Number(),
    exist:String,
    type:String,

});



export default mongoose.model('monster', Monster);
