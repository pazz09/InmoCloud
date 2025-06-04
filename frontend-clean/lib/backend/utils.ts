import { SQLParam } from "./types";

export function objectToSqlInsert(obj: Record<string, SQLParam>) {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  const placeholders = keys.map(() => '?').join(', ');
  const columns = keys.join(', ');
  return {
    queryPart: `(${columns}) VALUES (${placeholders})`,
    values
  };
}

export function objectToSqlUpdate(obj: Record<string, SQLParam>) {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  return {
    queryPart: `SET ${setClause}`,
    values
  };
}