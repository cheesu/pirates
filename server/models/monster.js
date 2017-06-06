import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Monster = new Schema({
    name: String,
    lv: Number(),
    hp:Number(),
    mp:Number(),
    ap:Number(),
    dp:Number(),
    speed:Number(),
    exist:{ type: Boolean, default: true },
    type:String,
    area:String,
    appearMsg:String,
    attackMsg:String,
    dieMsg:String,
    exp:Number(),

});



export default mongoose.model('monster', Monster);
