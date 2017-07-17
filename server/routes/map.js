import express from 'express';
import Map from '../models/map';
import Monster from '../models/monster';
const router = express.Router();




router.get('/getMap/:mapName', (req, res) => {
 // FIND THE USER BY USERNAME
 Map.findOne({ mapName: req.params.mapName}, (err, map) => {
     if(err) throw err;
     // RETURN SUCCESS

     Monster.findOne({ mapName: req.params.mapName, type:'boss'}, (err, mon) => {
        if(err) throw err;


      var monster =   eval(mon);
      if(monster == null){
        return res.json({
            mapInfo: map,
            bossLocal:"null"
        });
      }
      else{
        return res.json({
            mapInfo: map,
            bossLocal:monster.area
        });
      }



     });


 });
});

router.get('/nextMap/:mapName', (req, res) => {
 // FIND THE USER BY USERNAME
 Map.findOne({ mapName: req.params.mapName}, (err, map) => {
     if(err) throw err;
     var thisMap =   eval(map)
     Map.findOne({ mapName: thisMap.next}, (err, nextMap) => {
         if(err) throw err;
         // RETURN SUCCESS
         Monster.findOne({ mapName: req.params.mapName, type:'boss'}, (err, mon) => {
            if(err) throw err;
              var monster =   eval(mon)
              if(monster == null){
                return res.json({
                    mapInfo: nextMap,
                    bossLocal:"null"
                });
              }
              else{
                return res.json({
                    mapInfo: nextMap,
                    bossLocal:monster.area
                });
              }
         });

     });
 });
});

router.get('/prevMap/:mapName', (req, res) => {
 // FIND THE USER BY USERNAME
 Map.findOne({ mapName: req.params.mapName}, (err, map) => {
     if(err) throw err;
     var thisMap =   eval(map)
     Map.findOne({ mapName: thisMap.prev}, (err, prevMap) => {
         if(err) throw err;
         // RETURN SUCCESS
         Monster.findOne({ mapName: req.params.mapName, type:'boss'}, (err, mon) => {
            if(err) throw err;
              var monster =   eval(mon)
              if(monster == null){
                return res.json({
                    mapInfo: prevMap,
                    bossLocal:"null"
                });
              }
              else{
                return res.json({
                    mapInfo: prevMap,
                    bossLocal:monster.area
                });
              }
         });
     });
 });
});


export default router;
