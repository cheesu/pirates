import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Slave = new Schema({
        id: String,
        name:String,
        master:String,
        kind: String,
        tribe:String,
        job: String,
        lv: Number(),
        hp: Number(),
        mp: Number(),
        str:Number(),
        int: Number(),
        dex: Number(),
        exp: Number(),
        max_hp: Number(),
        max_mp: Number(),
        upStr: Number(),
        upInt: Number(),
        upDex: Number(),
        mount:Object(),
        msg:String,
        chat:Array(),
        skill: Array(),
        price: Number(),
});



export default mongoose.model('slave', Slave);
