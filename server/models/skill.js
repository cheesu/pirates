import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Skill = new Schema({
    name: String,
    job: String,
    lv:Number(),
    mp:Number(),
    casting:String,
    hit:Number(),
    attackMsg:String,
    dmg:Number(),
    coolTime:Number(),
    txt:String,
    sp:Object(),
});



export default mongoose.model('skill', Skill);
