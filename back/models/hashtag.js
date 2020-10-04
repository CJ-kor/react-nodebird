const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Hashtag extends Model {
  static init(sequelize) {
    return super.init({
      // id가 기본적으로 들어있다.
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    }, {
      modelName: 'Hashtag',
      tableName: 'hashtags',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci', // 이모티콘 저장
      sequelize,
    });
  }
  static associate(db) {
   // N:M 관계 -> 둘다 belongsTo
   // 해시태그 누르면 해당 게시글 뜨고, 하나의 게시글도 여러개 해시태그 가지고 있고
    db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
  }
};