import express from 'express';
import Fcm from '../models/fcm';

const router = express.Router();






/*
 SEARCH USER: GET /api/account/search/:username
 */
router.post('/getFcmData/', (req, res,next) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    console.log("test FCM");
    //console.log(req.body.data);
    let fcmData = req.body.data;

    // CHECK USER EXISTANCE
    Fcm.findOne({ endpoint: fcmData.endpoint }, (err, exists) => {
        if (err) throw err;
        if(exists){
            return res.status(409).json({
                error: "USERNAME EXISTS",
                code: 3
            });
        }

        // CREATE ACCOUNT
        let fcm = new Fcm({
            endpoint: req.body.data.endpoint,
            keys: req.body.data.keys,
        });


        // SAVE IN THE DATABASE
        fcm.save( err => {
            if(err) throw err;
            return res.json({ success: true });
        });

    });

});


export default router;
