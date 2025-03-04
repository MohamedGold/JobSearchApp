import * as dbService from '../DB/db.service.js';

export const paginate = async ({ page, size, model, populate = [], filter = {}, select = "" } = {}) => {
  page = parseInt(page) < 1 ? parseInt(process.env.PAGE) : parseInt(page);
  size = parseInt(size) < 1 ? parseInt(process.env.SIZE) : parseInt(size);
  const skip = (page - 1) * size;
  const count = await model.find(filter).countDocuments();
  const data = await dbService.find({ model, filter, populate, select, skip, limit: size });
  return { data, page, size, count };
};
