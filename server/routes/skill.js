import express from 'express';
import Skill from '../models/skill';

const router = express.Router();






/*
 SEARCH USER: GET /api/account/search/:username
 */
router.post('/getSkill/', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX

    if(req.body.job2 == undefined){
      Skill.find({job: req.body.job ,lv:{"$lt":40}}, {_id: false, name: true, lv: true, mp: true, txt:true })
          .limit(10)
          .sort({lv: -1})
          .exec((err, skills) => {
              if(err) throw err;
              res.json(skills);
          });
    }
    else{
      Skill.find({job: req.body.job, lv:{"$gte":40} })
          .limit(10)
          .sort({lv: -1})
          .exec((err, skills) => {
              if(err) throw err;
              res.json(skills);
          });
    }


});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/skill', (req, res) => {
    res.json([]);
});

export default router;
