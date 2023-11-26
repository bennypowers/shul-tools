import type { ComplexAttributeConverter } from "lit";
import { isValid } from "./date.js";

export const DateConverter: ComplexAttributeConverter = {
  fromAttribute(value) {
    const tryDate = new Date(value)
    return isValid(tryDate) ? tryDate : null;
  },
  toAttribute(date: Date) {
    return date?.toISOString() ?? null;
  },
}
