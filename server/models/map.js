import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Map = new Schema({
    mapName: String,
    map: String,
    next: String,
    prev: String,
    msg:Array(),
});



export default mongoose.model('map', Map);
