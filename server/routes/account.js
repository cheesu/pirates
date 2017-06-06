import express from 'express';
import Account from '../models/account';

const router = express.Router();


/*
    ACCOUNT SIGNUP: POST /api/account/signup
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
        3: USERNAM EXISTS
*/
router.post('/signup', (req, res) => {
    /* to be implemented */
    // CHECK USERNAME FORMAT
    let usernameRegex = /^[가-힣a-zA-Z0-9]+$/;

    if(!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error: "BAD USERNAME",
            code: 1
        });
    }

    // CHECK PASS LENGTH
    if(req.body.password.length < 4 || typeof req.body.password !== "string") {
        return res.status(400).json({
            error: "BAD PASSWORD",
            code: 2
        });
    }

    // CHECK USER EXISTANCE
    Account.findOne({ username: req.body.username }, (err, exists) => {
        if (err) throw err;
        if(exists){
            return res.status(409).json({
                error: "USERNAME EXISTS",
                code: 3
            });
        }

        // CREATE ACCOUNT
        let account = new Account({
            username: req.body.username,
            password: req.body.password,
            job: req.body.job,
            lv: 1,
            hp: 100,
            mp: 100,
            str: 10,
            int: 10,
            dex: 10,
            exp:0,
            max_hp:100,
            max_mp:100,
        });

        account.password = account.generateHash(account.password);

        // SAVE IN THE DATABASE
        account.save( err => {
            if(err) throw err;
            return res.json({ success: true });
        });

    });
});


/*
    ACCOUNT SIGNIN: POST /api/account/signin
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: LOGIN FAILED
*/
router.post('/signin', (req, res) => {
  if(typeof req.body.password !== "string") {
     return res.status(401).json({
         error: "LOGIN FAILED",
         code: 1
     });
 }

 // FIND THE USER BY USERNAME
 Account.findOne({ username: req.body.username}, (err, account) => {
     if(err) throw err;

     // CHECK ACCOUNT EXISTANCY
     if(!account) {
         return res.status(401).json({
             error: "LOGIN FAILED",
             code: 1
         });
     }

     // CHECK WHETHER THE PASSWORD IS VALID
     if(!account.validateHash(req.body.password)) {
         return res.status(401).json({
             error: "LOGIN FAILED",
             code: 1
         });
     }
     // ALTER SESSION
     let session = req.session;
     session.loginInfo = {
         _id: account._id,
         username: account.username
     };

     // RETURN SUCCESS
     return res.json({
         success: true
     });
 });
});

// 세션 확인 구현
router.get('/getinfo', (req, res) => {
  if(typeof req.session.loginInfo === "undefined") {
        return res.status(401).json({
            error: 1
        });
    }
    Account.find({username: req.session.loginInfo.username})
        .exec((err, account) => {
            if(err) throw err;
            res.json({info:account});
        });

    //res.json({ info: req.session.loginInfo });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => { if(err) throw err; });
  return res.json({ sucess: true });
});



/*
 SEARCH USER: GET /api/account/search/:username
 */
router.get('/search/:username', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var re = new RegExp('^' + req.params.username);
    Account.find({username: {$regex: re}}, {_id: false, username: true})
        .limit(5)
        .sort({username: 1})
        .exec((err, accounts) => {
            if(err) throw err;
            res.json(accounts);
        });
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/search', (req, res) => {
    res.json([]);
});

export default router;
