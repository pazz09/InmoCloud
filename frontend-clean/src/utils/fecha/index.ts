export function fechaToString(value: Date): string {
    return `${String(value.getFullYear()).padStart(4, '0')}` +
      `-${String(value.getMonth() + 1).padStart(2, '0')}` +
      `-${String(value.getDate()).padStart(2, '0')}`
}