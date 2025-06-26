const format = new Intl.DateTimeFormat("es-CL");

export const formatDate = (date: Date) => {
  return format.format(date);
};
