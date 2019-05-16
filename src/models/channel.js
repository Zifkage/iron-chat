const channel = (sequelize, DataTypes) => {
  const Channel = sequelize.define('channel', {
    title: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 125],
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 20],
      },
    },
  });

  return Channel;
};

export default channel;
