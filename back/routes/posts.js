const express = require('express');
const { Op } = require('sequelize');  // Op: Operator

const { Post, User, Image, Comment } = require('../models');

const router = express.Router();

// 게시글들 보내기
router.get('/', async (req, res, next) => {  // GET /posts
   try {
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
   } catch {
      console.error(error);
      next(error);
   }
}) 

module.exports = router;