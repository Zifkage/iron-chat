export const batchDiscussions = async (keys, models) => {
  const discussions = await models.Discussion.findAll({
    where: {
      id: keys,
    },
  });

  return keys.map(key =>
    discussions.find(discussion => discussion.id === key),
  );
};
