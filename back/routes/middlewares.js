// == 보안용 미들웨어 ==
// 로그인했는지, 로그아웃상태인지 등 검사하는 미들웨어

exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {     // 로그인실행했는지
      next();    // next(error) : 에러처리 미들웨어로,  next() : 다음 미들웨어로 
   } else {
      res.status(401).send('로그인이 필요합니다.')
   }
}

exports.isNotLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {     
      next();  // 다음 미들웨어로
   } else {
      res.status(401).send('로그인하지 않은 사용자만 접근 가능합니다.')
   }
}