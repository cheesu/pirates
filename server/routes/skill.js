import express from 'express';
import Skill from '../models/skill';

const router = express.Router();






/*
 SEARCH USER: GET /api/account/search/:username
 */
router.post('/getSkill/', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    Skill.find({job: req.body.job}, {_id: false, name: true, lv: true, mp: true, txt:true })
        .limit(10)
        .sort({lv: 1})
        .exec((err, skills) => {
            if(err) throw err;
            res.json(skills);
        });
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/skill', (req, res) => {
    res.json([]);
});

export default router;
