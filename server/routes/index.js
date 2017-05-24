import express from 'express';
import account from './account';

const router = express.Router();


/*
* 크롬에선 문제가 없는데 IE에선 캐시 컨트롤을 이상하게 하게 되면서 새 메모를 불러오지 못하는 버그가있습니다.

 해당 코드를 서버의 인덱스 라우터에 추가하여 오류를 해결하세요.
* */
router.use('/*', (req, res, next) => {
    res.setHeader("Expires", "-1");
    res.setHeader("Cache-Control", "must-revalidate, private");
    next();
});

router.use('/account', account);

export default router;
