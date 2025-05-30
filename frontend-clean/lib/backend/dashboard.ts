import db from "./db";

export async function getDashboardMetrics() {
  const [{ count: propiedadesActivas }] = await db.query(`
    SELECT COUNT(*) AS count FROM properties_t WHERE activa = TRUE;
  `);

  const [{ count: inquilinos }] = await db.query(`
    SELECT COUNT(*) AS count FROM users_t WHERE role = 'Arrendatario';
  `);

  const [{ count: propiedadesEnArriendo }] = await db.query(`
    SELECT COUNT(*) AS count FROM properties_t WHERE arrendatario_id IS NOT NULL;
  `);

  const [{ count: pagosAtrasados }] = await db.query(`
    SELECT COUNT(*) AS count 
    FROM transactions_t
    WHERE pagado = FALSE AND fecha_pago < NOW();
  `);

  return {
    propiedadesActivas: Number(propiedadesActivas),
    inquilinos: Number(inquilinos),
    propiedadesEnArriendo: Number(propiedadesEnArriendo),
    pagosAtrasados: Number(pagosAtrasados),
  };
}
