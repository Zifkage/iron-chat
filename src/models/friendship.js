const friendship = (sequelize, DataTypes) => {
  const Friendship = sequelize.define('friendship', {
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'The field friendId is missing.',
        },
      },
    },
  });

  Friendship.associate = models => {
    Friendship.belongsTo(models.User);
  };

  return Friendship;
};

export default friendship;
