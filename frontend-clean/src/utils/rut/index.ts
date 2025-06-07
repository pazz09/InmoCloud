export function formatRutInput(value: string): string {
  // const value = ev.target.value;
  // Remove any character that isn't digit or 'k'/'K'
  const clean = value.replace(/[^\dkK]/g, '').toUpperCase();

  const body = clean.slice(0, -1);

  // Format body with thousands separators
  let formattedBody = '';
  const reversed = body.split('').reverse();

  for (let i = 0; i < reversed.length; i++) {
    formattedBody = reversed[i] + formattedBody;
    if ((i + 1) % 3 === 0 && i + 1 !== reversed.length) {
      formattedBody = '.' + formattedBody;
    }
  }

  const dv = clean.slice(-1);
  return dv ? `${formattedBody}-${dv}` : formattedBody;
}

export function validarRut(rut: string): boolean {
  rut = rut.replace(/[^\dkK]/g, '').toUpperCase();
  if (rut.length < 8) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvCalculado;
}