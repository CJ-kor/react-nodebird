
const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init({
      // id가 기본적으로 들어있다.
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // RetweetId
    }, {
      modelName: 'Post',
      tableName: 'posts',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci', // 이모티콘 저장
      sequelize,
    });
  }
  static associate(db) {         // 시퀄라이즈에서 만들어줌
    db.Post.belongsTo(db.User); // post.addUser, post.getUser, post.setUser

    // <해시태그>
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' }); // post.addHashtags
    // N:M관계  post.addHashtag    through -> PostHashtag라는 테이블이 생성됨
    db.Post.hasMany(db.Comment); 
    // post.addComments, post.getComments
    db.Post.hasMany(db.Image); 
    // post.addImages, post.getImages

    // <좋아요>
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' }) // post.addLikers, post.removeLikers
   // 사용자/게시글 '좋아요' 관계 Like라는 테이블 생성
   // as: 'Likers'로 위 Post-User의 User와 구별

   //<리트윗>
   // 같은 Table 1:N, PostPost라는 테이블이 생성되고 PostId컬럼이 들어가는데 PostId 헷갈리니 RetweetId로
    db.Post.belongsTo(db.Post, { as: 'Retweet' }); // post.addRetweet
  }
};
