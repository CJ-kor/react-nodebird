//User모델(sql의 테이블과 매치) 설정, 모델은 보통 단수로 설정

const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class User extends Model {
   //MySQL에는 users 테이블로 생성. {모델컬럼 설정}, {모델자체 세팅}
  static init(sequelize) {
    return super.init({
      // id: {}  -> id는 안넣어줘도 MySQL이 알아서 id를 기본키로 넣어줌, id가 기본적으로 들어있다고 알고있어야 함
      email: {
        type: DataTypes.STRING(30), // VARCHAR: STRING, INT: INTEGER, TINYINT: BOOLEAN, DATETIME: DATE
        allowNull: false, // NOT NULL: allowNull(false)필수
        unique: true, // UNIQUE: unique 고유한 값, 중복X
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false, // 필수
      },
      password: {
        type: DataTypes.STRING(100),   // pw는 암호화하면 길어짐
        allowNull: false, // 필수
      },
    }, {
      modelName: 'User',
      tableName: 'users',
      charset: 'utf8',     // 한글 입력(이모티콘까지: utf8mb4)
      collate: 'utf8_general_ci', // 한글 저장
      sequelize,
    });
  }
  static associate(db) {
     db.User.hasMany(db.Post);  // 시퀄라이저가 user.addPosts 만듦, getPosts도 있음
     db.User.hasMany(db.Comment);  // user.addComments
     db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' });  // 사용자/게시글 '좋아요' 관계
        // through 'Like'라는 테이블 생성, 설정 안하면 UserPost라는 테이블이 기본적으로 생성됨
        // as: 'Liked'로 위 User-Post의 Post와 구별
     db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'FollowingId' });
     db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'FollowerId' });  
     // 같은 테이블인경우 foreignKey필요
     // foreignKey = 다른 테이블의 기본key
     // 새로 생성된 Follow테이블에 UserId, UserId 같은 컬럼이 생기므로 as로 컬럼명 설정 후 followingId와 followerId를 가져옴
  };
};