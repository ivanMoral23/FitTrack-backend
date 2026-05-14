import z, { email } from 'zod'

const userValidation = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  age: z.number().optional()
})

export async function validateUser (data) {
  return userValidation.safeParse(data)
}

const loginValidation = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

export async function validateLogin (data) {
  return loginValidation.safeParse(data)
}

