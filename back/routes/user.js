const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
// const db = require('../models');
// db.User를 models/index.js에서 가져옴
const { Op } = require('sequelize');
const { User, Post, Image, Comment } = require('../models');
// index.js에서 db를 export했으므로 구조분해할당으로 User를 가져옴 -> User = db.User
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();


// 내정보(loadMyInfo) 로그인상태에서 새로고침했을 때 사용자정보 보내줘서 로그인유지
router.get('/', async (req, res, next) => {     // GET /user
   try {
      if (req.user) {
         const fullUserWithoutPassword = await User.findOne({
            where: { id: req.user.id },
            attributes: {
               exclude: ['password']
            },
            include: [{ 
               model: Post,
               attributes: ['id'], //게시글 갯수만 가져오면 됨 
            }, {
               model: User,
               as: 'Followings',
               attributes: ['id'], //팔로잉 갯수만 가져오면 됨
            }, {
               model: User,
               as: 'Followers',
               attributes: ['id'], //팔로워 갯수만 가져오면 됨
            }]
         })
         return res.status(200).json(fullUserWithoutPassword);
      } else {
         res.status(200).json(null);
      }
   } catch (error) {
      console.error(error),
      next(error);
   }
});

// 팔로워목록
router.get('/followers', isLoggedIn, async (req, res, next) => { // GET /user/followers
   try {
      // 나를 먼저 찾고
      const user = await User.findOne({ where: { id:req.user.id }});
      if (!user) {
         res.status(403).send('없는 사람을 찾으려고 하시네요?')
      }
      const followers = await user.getFollowers({
         limit: parseInt(req.query.limit, 10),
      });
      res.status(200).json(followers)
   } catch (error) {
      console.log(error),
      next(error);
   }
});

// 팔로잉목록
router.get('/followings', isLoggedIn, async (req, res, next) => { // GET /user/followings
   try {
     const user = await User.findOne({ where: { id:req.user.id }});
      if (!user) {
         res.status(403).send('없는 사람을 찾으려고 하시네요?')
      }
      const followings = await user.getFollowings({
         limit: parseInt(req.query.limit, 10),
      });
      res.status(200).json(followings)
   } catch (error) {
      console.log(error),
      next(error);
   }
});

router.get('/:id', async (req, res, next) => {     // GET /user/3
   try {
      const fullUserWithoutPassword = await User.findOne({
         where: { id: req.params.id },
         attributes: {
            exclude: ['password']
         },
         include: [{ 
            model: Post,
            attributes: ['id'], //게시글 갯수만 가져오면 됨 
         }, {
            model: User,
            as: 'Followings',
            attributes: ['id'], //팔로잉 갯수만 가져오면 됨
         }, {
            model: User,
            as: 'Followers',
            attributes: ['id'], //팔로워 갯수만 가져오면 됨
         }]
      })
      if (fullUserWithoutPassword) {
         const data = fullUserWithoutPassword.toJSON();
         data.Posts = data.Posts.length; // 개인정보침해 예방
         data.Followers = data.Followers.length;
         data.Followings = data.Followings.length;
         res.status(200).json(data);
      } else {
         res.status(404).json('존재하지 않는 사용자입니다.')
      }
   } catch (error) {
      console.error(error),
      next(error);
   }
});

// 사용자의 게시글만 가져오기(LOAD_USER_POSTS_REQUEST)
router.get('/:id/posts', async (req, res, next) => {  // GET /user/1/posts
   try {
      const user = await User.findOne({ where: { id: req.params.id }});
      if (user) {
         const where = {};
         if (parseInt(req.query.lastId, 10)) { // 초기로딩이 아니고 스크롤해서 더 불러오는 상황
            where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }
         // lastId보다 작은 10개를 불러와라(Operator less than)
         } // 21 20 19 18 17 16 15 14 13 12 10 9 8 7 6 5 4 3 2 1
         const posts = await Post.findAll({
            where,
            limit: 10,        // limit 갯수제한, 
            // offset: 0,        
            // 건너뛰기 10, 100이면 101~110, 잘안씀(로딩중 삭제문제)
            // 그래서 offset 대신에 lastId를 지정해서 많이씀
            order: [       // [[]] <- sorting 여러개일수도 있어서
               ['createdAt', 'DESC'],
               [Comment, 'createdAt', 'DESC']  // 아래 Comment모델
            ],  

            include: [{
               model: User,   // 게시글 작성자
               attributes: ['id', 'nickname']
            }, {
               model: Image,
            }, {
               model: Comment,
               include: [{
                  model: User,     // 댓글 작성자
                  attributes: ['id', 'nickname']
               }]
            }, {
               model: User, // 좋아요 누른사람
               as: 'Likers',
               attributes: ['id']
            }, {
               model: Post,
               as: 'Retweet',
               include: [{
                  model: User,
                  attributes: ['id', 'nickname'],
               },{
                  model: Image,
               }]
            }],
         });
         // console.log(posts);
         res.status(200).json(posts);
      } else {
         res.status(404).send('존재하지 않는 사용자입니다.')
      } 
   } catch {
      console.error(error);
      next(error);
   }
}); 

//로그인(logIn)
// passport/local에서 done(서버에러, 성공여부, 클라이언트에러)을 ->로 할당 (err, user, info)
router.post('/login', isNotLoggedIn, (req, res, next) => {  // GET /user/login
   //아래 실행 전 isNotLoggedIn 먼저 실행
   passport.authenticate('local', (err, user, info) => {
      if (err) {           // server에러(500번대)
      console.error(err);
      return next(err);
      }
      if (info) {       // 클라이언트에러(400번대)
         return res.status(401).send(info.reason)  // 401: 허가되지 않은
      }
      return req.login(user, async (loginErr) => {
         if (loginErr) {         // passport로그인에서 err가 나는 경우(거의없음)
            console.error(loginErr)
            return next(loginErr);
         }
         // 위 user는 Post, Comment, Followings, Follows는 없고 password는 있음
         // model에서 associate 설정(hasMany, belongsToMany)한 컬럼들은 
         // User말고 별도 테이블에 저장되므로 없고 pw는 있음
         const fullUserWithoutPassword = await User.findOne({
            where: { id: user.id },
            // attributes: ['id', 'nickname', 'email'],  // User테이블에서 원하는 컬럼만 가져옴
            attributes: {
               exclude: ['password']   // User테이블에서 password만 빼고 가져옴
            },
            include: [{            // 다른테이블 associate컬럼 가져올때 include
               model: Post,     // LOG_IN_SUCCESS에 필요한 Post, Followings, Followers를 가져와야함 
            }, {
               model: User,
               as: 'Followings'     // Model에서 associate설정시 as를 썼으면 여기도
            }, {
               model: User,
               as: 'Followers',
            }]
         })
         // 내부적으로 res.setHeader('Cookie', 'fskekls') 보내주고 session과 연결
         return res.status(200).json(fullUserWithoutPassword);
         // 전부OK이면 사용자정보를 front로 넘겨줌, 그다음 app.js에서 session설정해야함
      })
   })(req, res, next)   //middleware에 parmeter넣는법(미들웨어확장 - 익스프레스 기법)
                        //passport.autheticate는 원래 req, res 쓸 수 없는 미들웨어인데 확장하는 특별한 방식
});

// 회원가입(signUp)
router.post('/', isNotLoggedIn, async (req, res, next) => {   // POST /user
   try {
      //중복 확인
      const exUser = await User.findOne({    
         where: {
            email: req.body.email,
         }
      });
      if (exUser) {
         return res.status(403).send('이미 사용중인 아이디입니다')  // 403: 금지
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);  // -> 암호화(bcrypt)
   
      await User.create({  // create 데이터를 넣음
         email: req.body.email,
         nickname: req.body.nickname,
         password: hashedPassword, 
      });   // front saga에서 넘긴 data를 req.body로 받음 

      res.status(200).send('ok');    // res.send가 먼저 실행될 수 있어 위에 async / await 사용.   200: 성공
   } catch (error) {
      console.error(error);
      next(error); 
      // next통해서 에러보냄  status 500(서버쪽문제)
    }
});

//로그아웃
router.post('/logout', isLoggedIn, (req, res, next) => {
   req.logout();
   req.session.destroy();
   res.send('ok');
});

// 닉네임 수정
router.patch('/nickname', isLoggedIn, async (req, res, next) => {
   try {
      await User.update({     // 수정 update내용, 조건
         nickname: req.body.nickname,
      }, {
         where: { id: req.user.id }
      });
      res.status(200).json({ nickname: req.body.nickname })
   } catch (error) {
      console.log(error),
      next(error);
   }
});

// 팔로우
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => { // PATCH /user/1/follow
   try {
      // user가 있는지 먼저 확인(유령user인지)
      const user = await User.findOne({ where: { id:req.params.userId }});
      if (!user) {
         res.status(403).send('없는 사람을 팔로우하려 하시네요?')
      }
      await user.addFollowers(req.user.id);
      res.status(200).json({ UserId: parseInt(req.params.userId, 10) })
   } catch (error) {
      console.log(error),
      next(error);
   }
});

// 언팔로우
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => { // DELETE /user/1/follow
   try {
      // user가 있는지 먼저 확인(유령user인지)
      const user = await User.findOne({ where: { id:req.params.userId }});
      if (!user) {
         res.status(403).send('없는 사람을 언팔로우하려 하시네요?')
      }
      await user.removeFollowers(req.user.id);
      res.status(200).json({ UserId: parseInt(req.params.userId, 10) })
   } catch (error) {
      console.log(error),
      next(error);
   }
});

// 팔로워 차단 (상대가 나를 언팔로우하는 것이랑 똑같음 -> 언팔로우 반대로)
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => { // DELETE /user/follower/1
   try {
      // 상대를 먼저 찾고
      const user = await User.findOne({ where: { id: req.params.userId }});
      if (!user) {
         res.status(403).send('없는 사람을 차단하려 하시네요?')
      }
      await user.removeFollowings(req.user.id);
      res.status(200).json({ UserId: parseInt(req.params.userId, 10) })
   } catch (error) {
      console.log(error),
      next(error);
   }
});

module.exports = router;