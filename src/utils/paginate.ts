import { Model, PopulateOptions } from "mongoose";

export interface PaginateResult<T> {
  results: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// FUNÇÃO DE PAGINAÇÃO PARA MONGOOSE
export async function paginate<T>(
  model: Model<T>,
  filter: object = {},
  page: number = 1,
  limit: number = 10,
  sort: Record<string, 1 | -1> = {},
  populate: (string | PopulateOptions)[] = [],
): Promise<PaginateResult<T>> {
  const total = await model.countDocuments(filter);

  let query = model
    .find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  if (populate.length > 0) {
    populate.forEach((p) => {
      query = query.populate([p]);
    });
  }

  const results = await query;

  return {
    results,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
}
