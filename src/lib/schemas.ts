import * as z from "zod";

const email = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z
    .string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
);

const password = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain a special character",
    ),
);

const confirmPassword = z
  .string({ message: "Confirm Password is required" })
  .min(1, "Confirm Password is required");

export const loginSchema = z.object({
  email,
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    firstName: z
      .string({ message: "First Name is required" })
      .min(3, "First Name must be at least 3 characters"),
    lastName: z
      .string({ message: "Last Name is required" })
      .min(3, "Last Name must be at least 3 characters"),
    email,
    password,
    confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirmPassword })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
