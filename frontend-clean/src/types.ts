
/* Esquema: Se utiliza para validar un tipo de dato. Por ejemplo:
 * ```ts
 * 
 * import {user_schema from "@/types"}
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
import { z } from 'zod';

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

  // no idea
  const expectedDigit =
    expectedCheck === 11 ?
    "0" : expectedCheck === 10 ?
    "K" : expectedCheck.toString();


  return checkDigit === expectedDigit;
};

// Zod schema
export const rut_schema = z
  .string()
  .refine(isValidRUT, {
    message: "El RUT es inválido",
  });

export const error_response_schema = <T extends z.ZodTypeAny>
(dataSchema: T) => z.object({
      status: z.literal("error"),
      message: z.string(),
      code: z.string(), // e.g., "VALIDATION_ERROR", "USER_NOT_FOUND"
      data: dataSchema.nullable().optional(), // optional even on error
});
export type error_response_t<T extends z.ZodTypeAny> = 
  z.infer<ReturnType<typeof error_response_schema<T>>>;

export const success_response_schema = <T extends z.ZodTypeAny>
(dataSchema: T) => z.object({
      status: z.literal("success"),
      data: dataSchema,
      message: z.string().optional(),
});


// Respuestas
export const response_schema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.discriminatedUnion("status", [
      success_response_schema(dataSchema),
      error_response_schema(dataSchema)
  ]);
  
export type response_t<T extends z.ZodTypeAny> = 
  z.infer<ReturnType<typeof response_schema<T>>>;

export const empty_response_schema = response_schema(z.null());
export type empty_response_t = z.infer<typeof empty_response_schema>;





export type SQLParam = string | number | boolean | Date | number | null;

export const OkPacket = z.object({
  insertId: z.union([z.string(), z.number()]).transform((val) =>
    typeof val === 'string' ? Number(val) : val
  ),
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
  nombre: z.string()
    .min(3, {message: "El nombre debe tener al menos 3 caracteres"})
    .max(100, {message: "El nombre no puede exceder los 100 caracteres"}),

  apellidos: z.string()
    .min(3, {message: "Los apellidos deben tener al menos 3 caracteres"})
    .max(150, {message: "Los apellidos no pueden exceder los 100 caracteres"}),

  telefono: z.string()
    .regex(/^\d{9}$/, {message: "El teléfono debe tener 9 dígitos"})
    .optional()
    .nullable(),
  
  rut: rut_schema,

  mail: z.string()
    .email({message: "El correo electrónico es inválido"})
    .optional()
    .nullable(),

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
export const user_search_schema = user_schema.partial();
export type user_search_t = z.infer<typeof user_search_schema>;

export const user_response_schema = response_schema(user_schema);
export type user_response_t = z.infer<typeof user_response_schema>;


// Log In POST /api/users/login
export const login_schema = z.object({
  rut:      rut_schema,
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


export const payment_schema = z.object({
  id: z.number(),
  fecha: z.date(),// z.date({required_error: "La fecha es obligatoria", message: "La fecha es obligatoria"}),
  //fecha: z.date(),

  tipo: z.boolean(), // 0: Giro 1: Depósito
  monto: z.number().gt(0, {message: "Ingrese un monto"}),
  pagado: z.boolean(),

  categoria: z.string(),
  detalle: z.string().optional().nullable(),

  usuario_id: z.number().gte(0, {message: "Seleccione un usuario"}),
  propiedad_id: z.number().optional().nullable(),

});

export type payment_t = z.infer<typeof payment_schema>;



export const payment_view_schema = payment_schema.extend({
  cliente: z.string(),
  propiedad: z.string().optional().nullable(),
});

export type payment_view_t = z.infer<typeof payment_view_schema>;

export const payment_search_params = payment_view_schema.partial().extend({
  monto_min: z.number().optional(),
  monto_max: z.number().optional(),
});

export type payment_search_params_t = z.infer<typeof payment_search_params>;

export const payment_form_data_schema = payment_schema.partial({id: true});
export type payment_form_data_t = z.infer<typeof payment_form_data_schema>;



export const token_schema = z.object({
  id: z.number(),
  role: user_role_enum,
})


export const token_decoded_schema = z.object({
  id: z.number(),
  role: user_role_enum,
  iat: z.number(), // issued at
  exp: z.number(), // expiration time
});

export type token_t = z.infer<typeof token_schema>;
export type token_decoded_t = z.infer<typeof token_decoded_schema>;


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


// // Búsqueda de usuario
// export const user_search_filters_schema = z.object({
//   name:          z.string().optional(),
//   property_name: z.string().optional(),
//   role:          user_role_enum.optional()
// });
// export type user_search_filters_t = z.infer<typeof user_search_filters_schema>;

export const db_user_schema = user_union_schema.transform((data) => {
  // Destructure `type` out; it will be `undefined` if not present
  const { type, ...rest } = data;
  return rest;
});


// PROPIEDADES
//

export const property_schema = z.object({
  id: z.number(),
  rol: z.string().max(15),
  direccion: z.string().min(1, { message: "La dirección es obligatoria" }),
  activa: z
    .union([z.boolean(), z.number()])
    .transform((val) => {
      if (typeof val === "number") return val === 1;
      return val;
    }),
  valor: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return Number.isInteger(num) ? parseInt(num.toString(), 10) : num;
    })
  .refine((val) => val > 0, { message: "El valor debe ser positivo" }),
  propietario_id: z.number(),
  arrendatario_id: z.number().optional().nullable(),
  fecha_arriendo: z.union([z.string(), z.date()]).transform((val) =>
    typeof val === 'string' ? new Date(val) : val
  ).optional().nullable()
});

export type property_t = z.infer<typeof property_schema>;

export const property_form_add_schema = property_schema.omit({id: true, arrendatario_id: true, fecha_arriendo: true});
export type property_form_add_t = z.infer<typeof property_form_add_schema>;

export const property_form_edit_schema = property_schema.omit({arrendatario_id: true, fecha_arriendo: true});
export type property_form_edit_t = z.infer<typeof property_form_edit_schema>;

//export const property_form_delete_schema = property_schema.pick({id: true});
export const property_form_delete_schema = z.object({
  id: z.number()
});
export type property_form_delete_t = z.infer<typeof property_form_delete_schema>;

export const property_form_arrendatario_schema = property_schema.pick({arrendatario_id: true, fecha_arriendo: true});
export type property_form_arrendatario_t = z.infer<typeof property_form_arrendatario_schema>;


export const property_view_schema = property_schema.extend({
  "propietario": z.string(),
  "arrendatario": z.string().optional().nullable(),
})
export type property_view_t = z.infer<typeof property_view_schema>;

export const property_search_schema = property_view_schema.partial();
export type property_search_t = z.infer<typeof property_search_schema>;



export const arrendatario_schema = user_schema.omit({role: true}).extend({
  propiedad: property_schema.optional().nullable(),
  role: z.literal(UserRoleEnum.ARRENDATARIO),
});
export type arrendatario_t = z.infer<typeof arrendatario_schema>;

export const propietario_schema = user_schema.omit({role: true}).extend({
  propiedades: z.array(property_schema).optional().nullable(),
  role: z.literal(UserRoleEnum.PROPIETARIO),
});
export type propietario_t = z.infer<typeof propietario_schema>;

export const client_union_schema = z.discriminatedUnion("role", [
  arrendatario_schema,
  propietario_schema,
]);
export type client_union_t = z.infer<typeof client_union_schema>;

export const client_list_schema = z.array(client_union_schema);
export type client_list_t = z.infer<typeof client_list_schema>;

// get zod object keys recursively
export const zodKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
	// make sure schema is not null or undefined
	if (schema === null || schema === undefined) return [];
	// check if schema is nullable or optional
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
     return zodKeys(schema.unwrap());
	// check if schema is an array
	if (schema instanceof z.ZodArray) return zodKeys(schema.element);
	// check if schema is an object
	if (schema instanceof z.ZodObject) {
		// get key/value pairs from schema
		const entries = Object.entries(schema.shape);
		// loop through key/value pairs
		return entries.flatMap(([key, value]) => {
			// get nested keys
			const nested = value instanceof z.ZodType ?
       zodKeys(value).map(subKey => `${key}.${subKey}`) : [];
			// return nested keys
			return nested.length ? nested : key;
		});
	}
	// return empty array
	return [];
};

