import { ZodError } from 'zod'

export const formatZodErrors = (error: ZodError): string[] => {
  return error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
}