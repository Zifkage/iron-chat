const channel = (sequelize, DataTypes) => {
  const Channel = sequelize.define('channel', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 45],
      },
    },
    description: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 125],
      },
    },
  });

  Channel.associate = models => {
    Channel.belongsTo(models.User);
    Channel.hasMany(models.Member, { onDelete: 'CASCADE' });
  };

  return Channel;
};

export default channel;
