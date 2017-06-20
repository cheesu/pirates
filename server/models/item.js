import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Item = new Schema({
  id: String,
   name: String,
   kind: String,
   min: Number(),
   max: Number(),
   price: Number(),
   job: String,
   type: String,
   msg: String,
   effectMSG:String,
   heal:String,
   option:Object(),
});



export default mongoose.model('item', Item);
