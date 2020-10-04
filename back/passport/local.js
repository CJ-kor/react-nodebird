// local login전략

const passport = require('passport');
const bcrypt = require('bcrypt');
const { Strategy: LocalStrategy } = require('passport-local');
// 구조분해시 변수명을  바꾸는 방법
const { User } = require('../models');

module.exports = () => {
   passport.use(new LocalStrategy({
      usernameField: 'email',    // req.body.email이다
      passwordField: 'password'            // req.body.password다
   }, 
   async (email, password, done) => {
      try {
         const user = await User.findOne({       // findOne은 await를 붙여야 하니까 앞에 async
            where: { email }  // ES6 shorcut  email: email
         });
         if (!user) {
            return done(null, false, { reason: '존재하지 않는 이메일입니다!' })
            // pasport에서 res.send하지는 않고 done
            // done(서버에러, 성공여부, 클라이언트에러)
         }
         // 만약 user 있다면 -> 암호화한 pw비교
         const result = await bcrypt.compare(password, user.password);
         if (result) {
            return done(null, user)
         }
         return done(null, false, { reason: '비밀번호가 틀렸습니다.' })

      } catch (error) {
         console.error(error);
         return done(error);
      }
   }));
};