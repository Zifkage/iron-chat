const demand = (sequelize, DataTypes) => {
  const Demand = sequelize.define('demand', {
    accepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Demand.associate = models => {
    Demand.belongsTo(models.User);
  };

  return Demand;
};

export default demand;
