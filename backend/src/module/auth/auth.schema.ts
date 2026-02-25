import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string().regex(/^[a-zA-Z ]+$/, "Name must contain only alphabets and spaces"),
  email: z.email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine((pw) => /[A-Z]/.test(pw), "Must contain an uppercase letter")
    .refine((pw) => /[a-z]/.test(pw), "Must contain a lowercase letter")
    .refine((pw) => /[0-9]/.test(pw), "Must contain a number")
    .refine((pw) => /[^a-zA-Z0-9]/.test(pw), "Must contain a special character"),
  role: z.enum(['author', 'reader'] as const, {
  message: "Role must be author or reader"
})
})

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>