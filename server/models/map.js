import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Map = new Schema({
    mapName: String,
    map: String,
    next: String,
    prev: String,
});



export default mongoose.model('map', Map);
