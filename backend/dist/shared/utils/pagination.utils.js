"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSkipLimit = exports.getPaginationData = void 0;
const getPaginationData = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
    };
};
exports.getPaginationData = getPaginationData;
const getSkipLimit = (page, limit) => {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
};
exports.getSkipLimit = getSkipLimit;
//# sourceMappingURL=pagination.utils.js.map