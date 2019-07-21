const message = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    text: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          args: true,
          msg: 'A message has to have a text.',
        },
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      default: 'SENT',
      validate: {
        notEmpty: {
          args: true,
          msg: 'The status field is empty',
        },
      },
    },
  });

  Message.associate = models => {
    Message.belongsTo(models.User);
    Message.belongsTo(models.Discussion);
  };

  return Message;
};

export default message;
