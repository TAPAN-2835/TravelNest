export const getPaginationData = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
  };
};

export const getSkipLimit = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};
