const demand = (sequelize, DataTypes) => {
  const Demand = sequelize.define('demand', {
    accepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    from: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    to: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  return Demand;
};

export default demand;
