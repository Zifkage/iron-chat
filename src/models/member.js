const member = sequelize => {
  const Member = sequelize.define('member');

  Member.associate = models => {
    Member.belongsTo(models.Channel);
    Member.belongsTo(models.User);
  };

  return Member;
};

export default member;
