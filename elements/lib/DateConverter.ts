import type { ComplexAttributeConverter } from "lit";

export const DateConverter: ComplexAttributeConverter = {
  fromAttribute(value) {
    const tryDate = new Date(value)
    if (tryDate.toString() === 'Invalid Date')
      return null;
    else
      return tryDate;
  },
  toAttribute(date: Date) {
    return date?.toISOString() ?? null;
  },
}
