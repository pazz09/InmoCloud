# Explicación del código de Inmocloud

Como sabrán esta es una aplicación de [React](https://react.dev/) y 
[NextJS](https://nextjs.org/).

En particular, NextJS nos permite ejecutar tanto el Frontend como el Backend
de nuestra aplicación, de una forma similar a la que lo hace Express.

## Router

NextJS ofrece dos opciones de ruteo, una es [Pages Router](https://nextjs.org/docs/pages) y la otra es [App Router](https://nextjs.org/docs/app). En los links adjuntos
es posible encontrar documentación asociada a ambos enrutadores.

## Pages Router

Utiliza los ficheros del sistema para mapear rutas de la aplicación.

Por ejemplo, un archivo `src/pages/index.tsx` sería lo que cargaría el
servidor web en una solicitud en la raíz. Por ejemplo: 

http://localhost:3000/

El archivo `index.tsx` se utiliza para indicar la ruta predeterminada de una ruta.

Entonces, si yo quisiera crear la página que carga cuando entro a 
http://localhost:3000/dashboard, entonces debería modificar el archivo
`src/pages/dashboard/index.tsx`
    

### API Router


El router "Pages" incluye un subsistema llamado API Routes, el cual nos permite
implementar el backend directamente en nuestra app NextJS. Sin embargo, en vez
de renderizar y enviar un componente tiene acceso directo a el Request y el 
Response, lo que puede utilizar para leer datos de entrada y en base a eso
generar una respuesta.

A continuación se adjunta un ejemplo de una ruta de API Hola Mundo en la ruta
`src/pages/api/hello.ts`

```ts
import type { NextApiRequest, NextApiResponse } from 'next'
 
type ResponseData = {
  message: string
}
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({ message: 'Hello from Next.js!' })
}
```


## Inmocloud

Actualmente, con el fin de facilitar la comunicación y la validación de la 
información del Backend y el Frontend se optó por la utilización de esquemas
Zod. Estos permiten verificar que objetos "desconocidos" (que fueron introducidos
por el usuario u obtenidos a través de la API) cumplen con el formato que
necesitamos.

Por ejemplo para el login, es posible definir lo siguiente:

```ts
// Log In POST /api/users/login
export const login_schema = z.object({
  rut:      rut_schema,
  password: z.string({required_error: "La contraseña es obligatoria"})
});

export type login_t = z.infer<typeof login_schema>;
```

De esta forma, si se hace un request con el cuerpo
```js
const request.body = { 
    "user": "admin",
    "password": "1232123"
}
```


y recibimos esto en el backend, podemos validarlo de la siguiente forma.


```ts
import { login_schema } from "@/types";
impor { z } from "zod";

/* Manejo de POST /api/login */

const response = req.body; // Objeto inseguro, obtenido en el request
try {

    const login_data = login_schema.parse(response);

    /* En este punto, podemos estar seguros que login_data
     * contiene un RUT válido y una contraseña válida. */

    login(login_data);

} catch (e) {

    // Si no, generamos un código de error.
    if (e instanceof z.ZodError) {
        res.status(400).json({
            status: "error",
            code: "INVALID_DATA",
            message: "Los datos ingresados no son válidos."
        })

    }

}

```


Una de las ventajas de usar Zod es que podemos reutilizar los mismos esquemas 
tanto en el backend como en el frontend. Esto permite que validemos los datos
antes de enviarlos al servidor, mostrando errores útiles al usuario sin 
necesidad de esperar una respuesta del backend.

Por ejemplo, para el formulario de login podemos usar el mismo login_schema en el frontend:

```tsx
import { login_schema } from "@/types";
import { z } from "zod";

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const rut = formData.get("rut");
  const password = formData.get("password");

  const input = { rut, password };

  const result = login_schema.safeParse(input);

  if (!result.success) {
    // Si la validación falla, podemos mostrar los errores en pantalla
    console.log("Errores de validación:", result.error.format());
    alert("Por favor revisa los datos ingresados.");
    return;
  }

  // Si pasa la validación, se puede enviar la solicitud al backend
  fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Respuesta del servidor:", data);
    });
}

```


## Manejo de errores

Al hacer llamadas a la API, las cosas pueden salir mal.


* Puede ocurrir un error interno en el frontend.
* **Puede ocurrir un error externo, en el backend** (de esto hablaré en esta
sección).

Ejemplos de errores que puede generar el backend son:
* `UserNotFoundError()`
* `InvalidPasswordError()`
* `UnauthorizedError()`
y muuuuchos más, puedes encontrarlos en `src/lib/backend/errors.ts`, cada
uno con su texto legible, código de error y estado HTTP.

Similar a lo que se hace  con los esquemas, existe una estandarización de
errores que tiene el nombre AppError. Qué es un AppError?

```ts
export class AppError extends Error {
    constructor(
        public code: string,
        public statusCode: number,
        message?: string
    ) {
        super(message ?? code);
    }
}
```

AppError es una clase que extiende de Error y que inicialmente se utiliza en el
backend y enviar el error al frontend, donde puede ser reconstruida con otro
tipo (pero accesible del frontend) en la ruta `src/utils/errors.ts`. Dentro del
código puede ser accedido con el atajo: 

`import { AppError } from '@/utils/errors`

## Respuesta del servidor

Para estandarizar y validar las respuestas del backend hacia el frontend, se 
optó por la creación de un esquema llamado `response_schema`, el cual tiene por
objetivo separar las respuestas positivas de las negativas.

Un `response_schema` es una unión indiscriminada de dos tipos que se plantearán 
a continuación, los cuales son error y éxito. En términos simples indica que,
dependiendo el valor de una variable es que Zod decide si utilizar uno u otro
de los esquemas, en este caso es la variable `"status"`, la cual puede ser
`"success"` o `"error"`.

### Respuesta positiva.

Una respuesta positiva tiene el tipo success_response_schema:

```ts

export const success_response_schema = 
<T extends z.ZodTypeAny>(dataSchema: T) => z.object({
      status: z.literal("success"),
      data: dataSchema,
      message: z.string().optional(),
});

```

Esta es una plantilla, cualquier esquema que se reciba como argmento será 
utilizado dentro del elemento interior "data".

De esta forma podemos por ejemplo generar una respuesta que retorne un usuario,
de tener éxito

```ts
const user_success_response_schema = success_response_schema(user_schema);

```

### Respuesta negativa

Una respuesta negativa tiene el tipo error_response_schema:

```ts
export const error_response_schema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
      status: z.literal("error"),
      message: z.string(),
      code: z.string(), // e.g., "VALIDATION_ERROR", "USER_NOT_FOUND"
      data: dataSchema.nullable().optional(), // optional even on error
});

```

La única diferencia es que incluye un "código de error", el cual permite
facilitar el manejo en el frontend switch/case para detectar errores específicos
y generar comportamiento determinado, por ejemplo:


```ts
if (e instanceof AppError && e.code === "UNAUTHORIZED")
    router.push("/login");
```

Este último campo es poderoso ya que nos permite reconstruir el AppError dentro
del frontend y poder manejar los `throw` de los `try/catch` como si fueran de 
la misma aplicación.


Por ejemplo, a la hora de iniciar sesión:

```tsx
export async function loginUser(data: z.infer<typeof login_schema>) {
  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    const parsedError = error_response_schema(z.any()).safeParse(json);

    if (parsedError.success) {
      const { code, message } = parsedError.data;
      throw new AppError(code, res.status, message);
    }

    throw new AppError("UNKNOWN", res.status, "Error desconocido del servidor.");
  }

  const parsedSuccess = loginSuccessSchema.safeParse(json);

  if (!parsedSuccess.success) {
    throw new AppError("INVALID_RESPONSE", 500, "Respuesta inesperada del servidor.");
  }

  return parsedSuccess.data.data; // usuario validado
}

```


## Servicios

Los servicios son una forma de abstraer la lógica del llamado a la API de los 
componentes. Estos son los que principalmente se ven beneficiados de los AppError.
Un ejemplo de esto es la función anterior, al cual se encarga únicamente de hacer
el llamado a la api y retornar el usuario validado.

## Hooks 

Los hooks personalizados son una excelente manera de abstraer la lógica de
estado (como carga, error, y datos) además de encapsular el uso de los servicios.

Por ejemplo podemos tener un hook que se encargue del manejo de iniciar sesión.

```ts
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(input: login_t) {
    setLoading(true);
    setError(null);
    try {
      const user = await loginUser(input);
      return user; // éxito, retorna el usuario
    } catch (err) {
      if (err instanceof AppError) {
        switch (err.code) {
          case "USER_NOT_FOUND":
            setError("El usuario no fue encontrado.");
            break;
          case "INVALID_PASSWORD":
            setError("La contraseña es incorrecta.");
            break;
          case "UNAUTHORIZED":
            setError("Acceso no autorizado.");
            break;
          default:
            setError(err.message);
        }
      } else {
        setError("Error inesperado. Intenta nuevamente.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}
```

De esta forma, el componente nos queda aún más reducido y fácil de analizar

```tsx
import { useRouter } from "next/router";
import { useLogin } from "@/hooks/useLogin";
import { login_schema } from "@/schemas";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading, error } = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const form = new FormData(e.currentTarget);
    const rut = form.get("rut");
    const password = form.get("password");

    const input = { rut, password };
    const parsed = login_schema.safeParse(input);

    if (!parsed.success) {
      setFormError("Los datos ingresados no son válidos.");
      return;
    }

    const user = await login(parsed.data);
    if (user) {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="rut" placeholder="RUT" />
      <input name="password" type="password" placeholder="Contraseña" />
      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Iniciar sesión"}
      </button>
      {formError && <p style={{ color: "orange" }}>{formError}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
```

### Componentes

Los componentes son la última forma de abstracción que se plantea, la idea
consiste en que el componente no tenga lógica y se pueda encargar únicamente del
renderizado de esa parte de la aplicación, actualizandose con los cambios de
parámetros de entrada.

```tsx
type LoginFormViewProps = {
  loading: boolean;
  error: string | null;
  formError: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function LoginFormView({
  loading,
  error,
  formError,
  onSubmit,
}: LoginFormViewProps) {
  return (
    <form onSubmit={onSubmit}>
      <input name="rut" placeholder="RUT" />
      <input name="password" type="password" placeholder="Contraseña" />
      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Iniciar sesión"}
      </button>
      {formError && <p style={{ color: "orange" }}>{formError}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

```

Finalmente, podemos reducir el LoginForm a 

```tsx
import { useLogin } from "@/hooks/useLogin";
import { login_schema } from "@/schemas";
import { useState } from "react";
import { useRouter } from "next/router";
import LoginFormView from "./LoginFormView";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading, error } = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const form = new FormData(e.currentTarget);
    const rut = form.get("rut");
    const password = form.get("password");

    const parsed = login_schema.safeParse({ rut, password });

    if (!parsed.success) {
      setFormError("Los datos ingresados no son válidos.");
      return;
    }

    const user = await login(parsed.data);
    if (user) {
      router.push("/dashboard");
    }
  }

  return (
    <LoginFormView
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      formError={formError}
    />
  );
}
```

Ahora podemos organizar el componente login de la siguiente forma

* `src/pages/login.tsx` : Vista final del componente (Frontend), importa todo lo demás
* `src/features/login/hooks/useLogin.ts`: Lógica de manejo de Login
* `src/services/login.ts`: Conexión con el backend
* `src/features/login/components/LoginForm.tsx`: Componente mínimo de login, 
    sólo se encarga del renderizado.
* `src/lib/backend/users/login.ts`: Maneja la lógica de inicio de sesión en el backend.
