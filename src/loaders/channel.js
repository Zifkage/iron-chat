export const batchChannels = async (keys, models) => {
  const channels = await models.Channel.findAll({
    where: {
      id: keys,
    },
  });

  return keys.map(key =>
    channels.find(channel => channel.id === key),
  );
};
