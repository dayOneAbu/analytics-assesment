import { ZodError } from 'zod'

export const formatZodErrors = (error: ZodError): string[] => {
  return error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
}

const INTERNAL_ERROR_MESSAGE = 'Internal server error'

type SafeApiError = {
  status: number
  message: string
  errors: string[]
}

export const toSafeApiError = (err: unknown): SafeApiError => {
  const maybeError = err as { status?: unknown; message?: unknown } | null | undefined
  const rawStatus = typeof maybeError?.status === 'number' ? maybeError.status : 500
  const status = rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500
  const rawMessage = typeof maybeError?.message === 'string' ? maybeError.message : ''
  const isClientError = status >= 400 && status < 500
  const message = isClientError && rawMessage ? rawMessage : INTERNAL_ERROR_MESSAGE

  return {
    status,
    message,
    errors: [message],
  }
}
