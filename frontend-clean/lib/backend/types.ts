import { z } from 'zod';

/* Esquema: Se utiliza para validar un tipo de dato. Por ejemplo:
 * ```ts
 * 
 * import {user_schema from "@backend/types"}
 *
 * // Inseguro, puede contener cualquier cosa, null, undefined, ...
 * const user_data = response.body;
 * const user_data_parsed = 
 *
 * 
 *
 * ```
 *
 */

// Roles
export enum UserRoleEnum {
  Arrendatario = 'Arrendatario',
  Propietario = 'Propietario',
  Corredor = 'Corredor',
  Administrador = 'Administrador'
}

export const user_role_enum = z.nativeEnum(UserRoleEnum,
          {required_error: "Es necesario especificar un rol"});
export type user_role_enum_t = z.infer<typeof user_role_enum>;

export const Roles = {
  ARRENDATARIO: user_role_enum.parse(   "Arrendatario"  ),
  PROPIETARIO: user_role_enum.parse(    "Propietario"   ),
  CORREDOR: user_role_enum.parse(       "Corredor"      ),
  ADMINISTRADOR: user_role_enum.parse(  "Administrador" ),
};


// Usuario (esquema).
export const user_schema = z.object({
  id: z.number({message: "El campo ID debe ser del tipo numérico"}),
  name: z.string({message: "El campo Nombre"}),
  rut: z.string(),
  role: user_role_enum,
  passwordHash: z.string().optional()
  },{required_error: "El campo Usuario es requerido"});
// Usuario
export type user_t = z.infer<typeof user_schema>;

// Usuario, sin passwordHash. Seguro de exponer al público
export const user_safe_schema = user_schema.omit({ passwordHash: true });
export type user_safe_t = z.infer<typeof user_safe_schema>;

// Usuario para POST /users/
export const user_add_schema = user_schema.omit({id: true})
export type user_add_t = z.infer<typeof user_add_schema>;




export const transaction_schema = z.object({
  id: z.number(),
  timestamp: z.date(),
  amount: z.number(),
});
export type transaction_t = z.infer<typeof transaction_schema>;


export const token_schema = z.object({
  id: z.number(),
  role: user_role_enum,
})

export type token_t = z.infer<typeof token_schema>;

export const response_schema = <T extends z.ZodTypeAny>(dataSchema: T) => 
z.object({
  status: z.enum(['success', 'error']),
  message: z.string().optional(),
  data: dataSchema.optional(),

})

export type response_t<T extends z.ZodTypeAny> = 
  z.infer<ReturnType<typeof response_schema<T>>>;

export type empty_response_t = response_t<z.ZodNull>;


export type SQLParam = string | number | boolean | Date | null;

export const OkPacket = z.object({
  insertId: z.bigint(),
  affectedRows: z.number(),
})

export type OkPacket_t = z.infer<typeof OkPacket>;

