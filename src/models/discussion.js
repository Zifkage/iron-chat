const discussion = (sequelize, DataTypes) => {
  const Discussion = sequelize.define('discussion', {
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  Discussion.associate = models => {
    Discussion.belongsTo(models.User);
    Discussion.belongsTo(models.Channel);
    Discussion.hasMany(models.Message, { onDelete: 'CASCADE' });
  };

  return Discussion;
};

export default discussion;
