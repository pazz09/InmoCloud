import { login_schema, error_response_schema, OkPacket } from "@/types";
import { login_t } from "@/types";
import { AppError } from "@/utils/errors";

export const loginUser = async (body: login_t) => {
  login_schema.parse(body); // validate before sending

  const res = await fetch(`${process.env.NEXT_URL || ''}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    const parsed = error_response_schema(OkPacket).parse(json);
    throw new AppError(parsed.code, res.status, parsed.message);
  }

  return json;
};
