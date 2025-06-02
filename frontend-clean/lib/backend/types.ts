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

//RUT 

// Helper function to validate RUT format and check digit
const isValidRUT = (rut: string): boolean => {
  rut = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  if (!/^\d{7,8}[0-9K]$/.test(rut)) return false;

  const body = rut.slice(0, -1);
  const checkDigit = rut.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedCheck = 11 - (sum % 11);
  const expectedDigit =
    expectedCheck === 11 ? "0" : expectedCheck === 10 ? "K" : expectedCheck.toString();

  return checkDigit === expectedDigit;
};

// Zod schema
const rut_schema = z
  .string()
  .refine(isValidRUT, {
    message: "El RUT es inválido",
  });

// Respuestas
export const response_schema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.discriminatedUnion("status", [
    z.object({
      status: z.literal("success"),
      data: dataSchema,
      message: z.string().optional(),
    }),
    z.object({
      status: z.literal("error"),
      message: z.string(),
      code: z.string(), // e.g., "VALIDATION_ERROR", "USER_NOT_FOUND"
      data: dataSchema.nullable().optional(), // optional even on error
    }),
  ]);
  
export type response_t<T extends z.ZodTypeAny> = 
  z.infer<ReturnType<typeof response_schema<T>>>;

export const empty_response_schema = response_schema(z.null());
export type empty_response_t = z.infer<typeof empty_response_schema>;





export type SQLParam = string | number | boolean | Date | number | null;

export const OkPacket = z.object({
  insertId:     z.string().transform((val) => Number(val)),
  affectedRows: z.number(),
})

export type OkPacket_t = z.infer<typeof OkPacket>;


// Roles
export enum UserRoleEnum {
  SIN_SESION    = 'Sin sesión',
  ARRENDATARIO  = 'Arrendatario',
  PROPIETARIO   = 'Propietario',
  CORREDOR      = 'Corredor',
  ADMINISTRADOR = 'Administrador'

}

export const user_role_enum = z.nativeEnum(UserRoleEnum,
          {required_error: "Es necesario especificar un rol"});
export type user_role_enum_t = z.infer<typeof user_role_enum>;

export const Roles = {
  SIN_SESION:     user_role_enum.parse("Sin sesión"    ),
  ARRENDATARIO:   user_role_enum.parse("Arrendatario"  ),
  PROPIETARIO:    user_role_enum.parse("Propietario"   ),
  CORREDOR:       user_role_enum.parse("Corredor"      ),
  ADMINISTRADOR:  user_role_enum.parse("Administrador" ),
};

export const RoleHierarchy = [
  UserRoleEnum.ARRENDATARIO,
  UserRoleEnum.PROPIETARIO,
  UserRoleEnum.CORREDOR,
  UserRoleEnum.ADMINISTRADOR
]

export const rolePriority: Record<user_role_enum_t, number> = {
  [UserRoleEnum.SIN_SESION]: -1,
  [UserRoleEnum.ARRENDATARIO]: 0,
  [UserRoleEnum.PROPIETARIO]: 1,
  [UserRoleEnum.CORREDOR]: 2,
  [UserRoleEnum.ADMINISTRADOR]: 3,
};

const base_user = z.object({
  id: z.number(),
  name: z.string(),
  rut: rut_schema,
  role: user_role_enum,
});

export const user_safe_schema = base_user.extend({
  type: z.literal("safe"),
});

export const user_schema = base_user.extend({
  passwordHash: z.string(),
  type: z.literal("full"),
});

export const user_form_data = user_schema.omit({id: true});
export type user_form_data_t = z.infer<typeof user_form_data>;


// Discriminated union based on `type`
export const user_union_schema = z.discriminatedUnion("type", [
  user_safe_schema,
  user_schema,
]);

export type user_union_t = z.infer<typeof user_union_schema>;


export type user_t = z.infer<typeof user_schema>;
export type user_safe_t = z.infer<typeof user_safe_schema>;



// Lista de usuarios:
export const users_list_schema = z.array(user_union_schema);
export type users_list_t = z.infer<typeof users_list_schema>;



// Búsqueda de usuario (esquema)
export const user_search_schema = z.object({
  name:          z.string().optional(),
  property_name: z.string().optional()
});
export type user_search_t = z.infer<typeof user_search_schema>;

export const user_response_schema = response_schema(user_schema);
export type user_response_t = z.infer<typeof user_response_schema>;



// Log In POST /api/users/login
export const login_schema = z.object({
  rut:      z.string({required_error: "El RUT es obligatorio"}),
  password: z.string({required_error: "La contraseña es obligatoria"})
});

export type login_t = z.infer<typeof login_schema>;

export const login_response_schema = z.object({
  user:   user_safe_schema,
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



export type Mode  = "add" | "edit";

// Usuario para POST /api/users/id
export const user_add_schema = user_schema.omit({id: true})
export type user_add_t = z.infer<typeof user_add_schema>;

export const update_response_schema = response_schema(OkPacket);
export type update_response_t = z.infer<typeof update_response_schema>;


// export type user_form_data = z.infer<typeof user_add_schema| typeof user_schema>;
