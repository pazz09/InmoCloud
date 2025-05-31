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
 * Tipo: Se utiliza para asignar tipo de los objetos. Por ejemplo
 * (response: user_t)
 * 
 *
 * ```
 *
 */

// Respuestas

export const response_schema = <T extends z.ZodTypeAny>(dataSchema: T) => 
z.object({
  status:   z.enum(['success', 'error']),
  message:  z.string().optional(),
  data:     dataSchema.optional(),

})

export type response_t<T extends z.ZodTypeAny> = 
  z.infer<ReturnType<typeof response_schema<T>>>;

export const empty_response_schema = response_schema(z.null());
export type empty_response_t = z.infer<typeof empty_response_schema>;


export type SQLParam = string | number | boolean | Date | null;

export const OkPacket = z.object({
  insertId:     z.bigint(),
  affectedRows: z.number(),
})

export type OkPacket_t = z.infer<typeof OkPacket>;


// Roles
export enum UserRoleEnum {
  ARRENDATARIO  = 'Arrendatario',
  PROPIETARIO   = 'Propietario',
  CORREDOR      = 'Corredor',
  ADMINISTRADOR = 'Administrador'
}

export const user_role_enum = z.nativeEnum(UserRoleEnum,
          {required_error: "Es necesario especificar un rol"});
export type user_role_enum_t = z.infer<typeof user_role_enum>;

export const Roles = {
  ARRENDATARIO:   user_role_enum.parse("Arrendatario"  ),
  PROPIETARIO:    user_role_enum.parse("Propietario"   ),
  CORREDOR:       user_role_enum.parse("Corredor"      ),
  ADMINISTRADOR:  user_role_enum.parse("Administrador" ),
};


// Usuario (esquema).
export const user_schema = z.object({
  id:           z.number({message: "El campo ID debe ser del tipo numérico"}),
  name:         z.string({message: "El campo Nombre"}),
  rut:          z.string(),
  role:         user_role_enum,
  passwordHash: z.string()
  },{required_error: "El campo Usuario es requerido"});
export type user_t = z.infer<typeof user_schema>;

// Usuario (esquema), sin passwordHash. Seguro de exponer al público
export const user_safe_schema = user_schema.omit({ passwordHash: true });
export type user_safe_t = z.infer<typeof user_safe_schema>;

// Usuario para POST /api/users/
export const user_add_schema = user_schema.omit({id: true})
export type user_add_t = z.infer<typeof user_add_schema>;

// Búsqueda de usuario (esquema)
export const user_search_schema = z.object({
  name:          z.string().optional(),
  property_name: z.string().optional()
});
export type user_search_t = z.infer<typeof user_search_schema>;



// Log In POST /api/users/login
export const login_schema = z.object({
  rut:      z.string({required_error: "El RUT es obligatorio"}),
  password: z.string({required_error: "La contraseña es obligatoria"})
});

export type login_t = z.infer<typeof login_schema>;

export const login_response_schema = z.object({
  user:   user_schema,
  token:  z.string({required_error: 
          "El token es necesario para acceder a la funcionalidad del sistema"}),
});

export const response_login = response_schema(login_response_schema);
export type response_login_t = z.infer<typeof response_login>;


export const transaction_schema = z.object({
  id:         z.number(),
  timestamp:  z.date(),
  amount:     z.number(),
});
export type transaction_t = z.infer<typeof transaction_schema>;


export const token_schema = z.object({
  id: z.number(),
  role: user_role_enum,
})

export type token_t = z.infer<typeof token_schema>;


export const dashboard_metrics_schema = z.object({
  propiedadesActivas:     z.number().positive(),
  inquilinos:             z.number().positive(),
  propiedadesEnArriendo:  z.number().positive(),
  pagosAtrasados:         z.number().positive()
})

export type dashboard_metrics_t = z.infer<typeof dashboard_metrics_schema>;
export const dashboard_response_schema = 
  response_schema(dashboard_metrics_schema);
export type dashboard_response_t = z.infer<typeof dashboard_response_schema>;


