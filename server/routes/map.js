import express from 'express';
import Map from '../models/map';

const router = express.Router();




router.get('/getMap/:mapName', (req, res) => {
 // FIND THE USER BY USERNAME
 Map.findOne({ mapName: req.params.mapName}, (err, map) => {
     if(err) throw err;
     // RETURN SUCCESS
     return res.json({
         mapInfo: map
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
         return res.json({
             mapInfo: nextMap
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
         return res.json({
             mapInfo: prevMap
         });
     });
 });
});


export default router;
