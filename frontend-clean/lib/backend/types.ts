import { z, ZodTypeAny } from 'zod';

export enum UserRoleEnum {
  Corredor = 'Corredor',
  Propietario = 'Propietario',
  Arrendatario = 'Arrendatario',
  Administrador = 'Administrador'
}

export const user_role_enum = z.nativeEnum(UserRoleEnum);

export const user_schema = z.object({
  id: z.number(),
  name: z.string(),
  rut: z.string(),
  role: user_role_enum,
  passwordHash: z.string().optional()
  });

export const user_add_schema = user_schema.omit({"id": true})
export type user_add_t = z.infer<typeof user_add_schema>;

export type user_t = z.infer<typeof user_schema>;


export type transaction_t = {
  id: number;
  timestamp: Date;
  amount: number;
}


// export type token_t = {
//   id: number;
//   role: UserRoleEnum;
// }
//
//
export const token_schema = z.object({
  id: z.number(),
  role: user_role_enum,
})

export type token_t = z.infer<typeof token_schema>;

export const response_schema = <T extends ZodTypeAny>(dataSchema: T) => z.object({
  status: z.enum(['success', 'error']),
  error: z.string().optional(),
  data: dataSchema.optional(),

})

export type response_t<T extends ZodTypeAny> = z.infer<ReturnType<typeof response_schema<T>>>;


export type SQLParam = string | number | boolean | Date | null;

export const OkPacket = z.object({
  insertId: z.bigint(),
  affectedRows: z.number(),
})

export type OkPacket_t = z.infer<typeof OkPacket>;
