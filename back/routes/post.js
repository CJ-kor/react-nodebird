const express = require('express');
const multer = require('multer');
const path = require('path');    // path: 노드에서 제공
const fs = require('fs');  //파일시스템 제어(노드에서 제공)

const { Post, Comment, Image, User, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {    // 사진저장할 back/uploads 폴더 만드려고 fs사용
   fs.accessSync('uploads')
} catch (error) {
   console.log('uploads폴더가 없으므로 생성합니다.')
   fs.mkdirSync('uploads'); // back폴더에 uploads폴더 생성됨
}

// multer는 공통으로 안하고 라우터마다 세팅(이미지 올리는 형식 바뀔수있어서)
const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, done) {      // 하드디스크 uploads폴더에 저장
         done(null, 'uploads')
      },
      filename(req, file, done) {   //파일이름 중복문제해결 if) aaa.png
         const ext = path.extname(file.originalname); //확장자추출(.png)
         const basename = path.basename(file.originalname, ext); //aaa
         done(null, basename + '_' + new Date().getTime() + ext); //aaa_324322123.png
      },
   }),
   limits: { fileSize: 20 * 1024 * 1024 } // 20Mb
});

// 게시글 추가
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {   // POST /post
   try {
      const hashtags = req.body.content.match(/#[^\s#]+/g); // match 정규표현식과 일치하는 것만
      const post = await Post.create({   // 데이터를 넣음
         content: req.body.content,
         UserId: req.user.id,       
         // Login해서 deserialize되면 req.user 안에 정보담김
      });
      if (hashtags) {   // 게시글에 해시태그가 있으면
         const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() }
         }))); // slice(1) : #를 떼어냄
         // findOrCreate: 이미 있으면 생성X
         await post.addHashtags(result.map((v) => v[0])); // findOrCreate때문에 result결과가 [[aa, true],[cc, true]] 이런식으로 돼 있음
      }
      if (req.body.image) {
         if (Array.isArray(req.body.image)) { //이미지를 여러개 올리면 image: [aaa.png, bbb.png]배열로 올라감
            const images = await Promise.all(req.body.image.map((image) => Image.create({ src: image })));
            // Promise.all 한번에 여러개가 DB에 저장됨
            await post.addImages(images);
         } else {  // 하나만 올리면 image: aaa.png
            const image = await Image.create({ src: req.body.image });
            await post.addImage(image);
         }
      }
      const fullPost = await Post.findOne({
         where: { id: post.id },
         include: [{
            model: Image,
         }, {
            model: Comment,
            include: [{
               model: User,   // 댓글 작성자
               attributes: ['id', 'nickname']
            }]      
         }, {
            model: User,   // 게시글 작성자
            attributes: ['id', 'nickname']
         }, {
            model: User, // 좋아요 누른사람
            as: 'Likers',
            attributes: ['id']
         }]
      })
      res.status(201).json(fullPost);   
      // 넣은데이터 + include데이터 front로
      // data(게시글)는 보통 json으로 응답
   } catch (error) {
      console.error(error),
      next(error);
   }
});

//이미지 업로드 (여러장 올릴수 있게 하려 array로, 한장만이면 single)
router.post('/images', isLoggedIn, upload.array('image'), async (req, res, next) => {  // POST /post/images
   try {
      console.log(req.files);
      res.json(req.files.map((v) => v.filename));  // 파일명만 리턴
   } catch (error) {
      console.log(error),
      next(error);
   }
})

//리트윗
router.post('/:postId/retweet', isLoggedIn, async (req, res, next) => {   // POST /post/postId/retweet (from saga)
   try {
      const post = await Post.findOne({
         where: { id: req.params.postId },
         include: [{
            model: Post,
            as: 'Retweet',
         }],
      });
      if(!post) {
         return res.status(403).send('존재하지 않는 게시글입니다.');
      }
      if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
      // 자신글 리트윗 또는 자신글을 리트윗한걸 자신이 다시 리트윗
         return res.status(403).send('자신의 글은 리트윗할 수 없습니다.');
      }
      const retweetTargetId = post.RetweetId || post.id;
      // 리트윗됐던것은 원래 오리지날 id사용
      const exPost = await Post.findOne({
         where: {
            UserId: req.user.id,
            RetweetId: retweetTargetId,
         },
      });
      if (exPost) {
         return res.status(403).send('이미 리트윗했습니다.')
      }
      const retweet = await Post.create({
         UserId: req.user.id,
         RetweetId: retweetTargetId,
         content: 'retweet'
      });
      const retweetWithPrevPost = await Post.findOne({
         where: { id: retweet.id },
         include: [{
            model: Post,
            as: 'Retweet',
            include: [{
               model: User,
               attributes: ['id', 'nickname'],
            },{
               model: Image,
            }]
         }, {
            model: User,
            attributes: ['id', 'nickname'],
         }, {
            model: Image,
         }, {
            model: Comment,
            include: [{
               model: User,
               attributes: ['id', 'nickname'],
            }],
         }, {
            model: User, // 좋아요 누른사람
            as: 'Likers',
            attributes: ['id']
         }],
      })
      res.status(201).json(retweetWithPrevPost);
   } catch (error) {
      console.error(error),
      next(error);
   }
});

//로드 포스트(싱글)
router.get('/:postId', isLoggedIn, async (req, res, next) => {   // GET /post/1
   try {
      const post = await Post.findOne({
         where: { id: req.params.postId },
         include: [{
            model: User,
            attributes: ['id', 'nickname'],
         }, {
            model: Image,
         }, {
            model: Comment,
            include: [{
               model: User,
               attributes: ['id', 'nickname'],
               order: [['createdAt', 'DESC']],
            }],
         }, {
            model: User, // 좋아요 누른사람
            as: 'Likers',
            attributes: ['id']
         }],
      })
      res.status(200).json(post);
   } catch (error) {
      console.error(error),
      next(error);
   }
});

//댓글 추가
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {   // POST /post/postId/comment (from saga)
   try {
      const post = await Post.findOne({
         where: { id: req.params.postId }
      });
      if(!post) {
         return res.status(403).send('존재하지 않는 게시글입니다.');
      }
      const comment = await Comment.create({
         content: req.body.content,
         PostId: parseInt(req.params.postId, 10),      //동적변화
         UserId: req.user.id,
      });
      const fullComment = await Comment.findOne({
         where: { id: comment.id },
         include: [{
            model: User,
            attributes: ['id', 'nickname']
         }]
      })
      res.status(201).json(fullComment);   // 넣은데이터 front로
   } catch (error) {
      console.error(error),
      next(error);
   }
});
// 좋아요 추가
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => { // PATCH /post/1/like
   try {
      const post = await Post.findOne({
         where: { id: req.params.postId }
      });
      if (!post) {
         return res.status(403).send('게시글이 존재하지 않습니다.');
      }
      await post.addLikers(req.user.id); // addLikers 시퀄에서 제공
      res.json({ PostId: post.id, UserId: req.user.id })
   } catch (error) {
      console.log(error),
      next(error);
   }
});
// 좋아요 삭제
router.delete('/:postId/like', isLoggedIn, async (req, res, next) => { // delete /post/1/like
   try {
      const post = await Post.findOne({
         where: { id: req.params.postId }
      });
      if (!post) {
         return res.status(403).send('게시글이 존재하지 않습니다.');
      }
      await post.removeLikers(req.user.id); // removeLikers 시퀄에서 제공
      res.json({ PostId: post.id, UserId: req.user.id })
   } catch (error) {
      console.log(error),
      next(error);
   }
});
// 게시글 삭제
router.delete('/:postId', isLoggedIn, async (req, res, next) => {  //DELETE /post/1
   try {
      await Post.destroy({          // destroy 삭제
         where: { 
            id: req.params.postId,
            userId: req.user.id,       // 내가 쓴 글만 지울 수 있음
         },         
      });
      res.status(200).json({ PostId: parseInt(req.params.postId, 10) })  // params는 문자열이라 parseInt해야함
   } catch (error) {
      console.log(error),
      next(error);
   }
});

module.exports = router;

