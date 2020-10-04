const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Comment extends Model {
  static init(sequelize) {
    return super.init({
      // id가 기본적으로 들어있다.
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // UserId: 1   // belongsTo
      // PostId: 3   // belongsTo
    }, {
      modelName: 'Comment',
      tableName: 'comments',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci', // 이모티콘 저장
      sequelize,
    });
  }

  static associate(db) {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  }
};


// 예전 문법
// module.exports = (sequelize, DataTypes) => {
//    const Comment = sequelize.define('Comment', { 
//    // id: {}  기본적으로 들어있음
//       content: {
//          type: DataTypes.TEXT,      // TEXT: TEXT
//          allowNull: false,
//       },
//       // UserId: 1,     // belongsTo
//       // PostId: 3      // belonstTo
//    }, {
//       charset: 'utf8mb4',  // 이모티콘포함  
//       collate: 'utf8mb4_general_ci',
//    });
//    Comment.associate = (db) => {
//       db.Comment.belongsTo(db.User);
//       db.Comment.belongsTo(db.Post);
//    }
   
//    return Comment;
// }