import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Monster = new Schema({
    name: String,
    lv: Number(),
    hp:Number(),
    maxHP:Number(),
    mp:Number(),
    ap:Number(),
    dp:Number(),
    speed:Number(),
    exist:{ type: Boolean, default: true },
    type:String,
    mapName:String,
    area:String,
    appearMsg:String,
    attackMsg:String,
    dieMsg:String,
    exp:Number(),
    gold:Number(),
    dropItem:Array(),
    dropPer:Number(),

});



export default mongoose.model('monster', Monster);
