import z from "zod";
import { SQLParam } from "@/types";

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

export function extractFromRow<T>(
  row: Record<string, SQLParam>,
  prefix: string,
  schema: z.ZodType<T>,
  allowNull = false
): T | null {
  const data: Record<string, SQLParam> = {};

  for (const key of Object.keys(row)) {
    if (key.startsWith(`${prefix}_`)) {
      const strippedKey = key.slice(prefix.length + 1);
      const value = row[key];
      if (value !== null) {
        data[strippedKey] = value;
      }
    }
  }

  const isEmpty = Object.keys(data).length === 0;
  if (allowNull && isEmpty) return null;

  return schema.parse(data);
}
