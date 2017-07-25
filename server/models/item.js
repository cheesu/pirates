import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Item = new Schema({
  id: String,
   name: String,
   kind: String,
   min: Number(),
   max: Number(),
   price: Number(),
   jPrice:Object(),
   mPrice:Array(),
   job: String,
   type: String,
   msg: String,
   effectMSG:String,
   heal:String,
   mapName:String,
   socket1:Object,
   socket2:Object,
   option:Object(),
   enhancementCount:Number(),
   changeOptionCount:Number(),
});



export default mongoose.model('item', Item);
