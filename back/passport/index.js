const passport = require('passport');
const local = require('./local');  // local파일 만들어서 로그인전략 설정
// passport config는 app.js에서
const { User } = require('../models');



module.exports = () => {
   // == 서버에서 user전체 정보 가지고 있기 무거우니 id만, 필요할때 다시 복구 ==
   passport.serializeUser((user, done) => {
      done(null, user.id)     
      // serialize : session에서 id만 저장함(메모리과부하 막기위해)
   });

   passport.deserializeUser(async (id, done) => {
      // deserialize : id로 다시 전체 정보(done) 가져옴
      try {
        const user = await User.findOne({ where: { id } });    // ES6 id: id
        done(null, user);         // id를 통해서 user 복구, req.user안에 넣어줌
      } catch (error) {
         console.error(error);
         done(error);
      }
   });

   local();
}