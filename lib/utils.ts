import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates data against a JSON schema
 * @param data - The data to validate
 * @param schema - JSON schema object
 * @returns Object with success boolean and error message if validation fails
 */
export function validateSchema(
  data: unknown,
  schema: Record<string, unknown>
): { success: boolean; error?: string } {
  try {
    // Convert JSON schema to Zod schema
    const zodSchema = jsonSchemaToZod(schema);
    zodSchema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}

/**
 * Converts a JSON schema to a Zod schema
 * This is a basic implementation - for production, consider using a dedicated library
 */
function jsonSchemaToZod(schema: Record<string, unknown>): z.ZodType {
  const type = schema.type as string;

  switch (type) {
    case "string":
      let stringSchema = z.string();
      if (schema.minLength)
        stringSchema = stringSchema.min(schema.minLength as number);
      if (schema.maxLength)
        stringSchema = stringSchema.max(schema.maxLength as number);
      if (schema.pattern)
        stringSchema = stringSchema.regex(new RegExp(schema.pattern as string));
      return stringSchema;

    case "number":
      let numberSchema = z.number();
      if (schema.minimum !== undefined)
        numberSchema = numberSchema.min(schema.minimum as number);
      if (schema.maximum !== undefined)
        numberSchema = numberSchema.max(schema.maximum as number);
      return numberSchema;

    case "integer":
      let intSchema = z.number().int();
      if (schema.minimum !== undefined)
        intSchema = intSchema.min(schema.minimum as number);
      if (schema.maximum !== undefined)
        intSchema = intSchema.max(schema.maximum as number);
      return intSchema;

    case "boolean":
      return z.boolean();

    case "object":
      const properties = schema.properties as
        | Record<string, Record<string, unknown>>
        | undefined;
      const required = schema.required as string[] | undefined;

      if (!properties) return z.object({}).passthrough();

      const shape: Record<string, z.ZodType> = {};
      for (const [key, propSchema] of Object.entries(properties)) {
        const zodType = jsonSchemaToZod(propSchema);
        shape[key] = required?.includes(key) ? zodType : zodType.optional();
      }

      return z.object(shape).passthrough();

    case "array":
      const items = schema.items as Record<string, unknown> | undefined;
      if (items) {
        const itemSchema = jsonSchemaToZod(items);
        let arraySchema = z.array(itemSchema);
        if (schema.minItems)
          arraySchema = arraySchema.min(schema.minItems as number);
        if (schema.maxItems)
          arraySchema = arraySchema.max(schema.maxItems as number);
        return arraySchema;
      }
      return z.array(z.unknown());

    default:
      // For unsupported types, allow any value
      return z.unknown();
  }
}
