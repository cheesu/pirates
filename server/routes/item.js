import express from 'express';
import Item from '../models/item';
import Account from '../models/account';
const router = express.Router();

/*
 SEARCH USER: GET /api/account/search/:username
 */
router.get('/getStoreItems/', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    Item.find({type: "normal"})
        .sort({id: 1})
        .exec((err, items) => {
            if(err) throw err;
            res.json(items);
        });
});

// 아이템 가져오기
router.get('/getUserItem', (req, res) => {
  if(typeof req.session.loginInfo === "undefined") {
        return res.status(401).json({
            error: 1
        });
    }

    Account.find({username: req.session.loginInfo.username})
        .exec((err, account) => {
            if(err) throw err;
            let userInfo = eval(account[0]);

            // 아이템 출력
            Item.find({id: { $in:userInfo.item }})
                .exec((err, items) => {
                    if(err) throw err;
                    res.json({itemList:items,gold:userInfo.gold});
                });

        });
});



// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/item', (req, res) => {
    res.json([]);
});

export default router;
