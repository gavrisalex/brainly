import { z } from "zod";

// Define the schema for your form
export const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters long." }),
  email: z.string().email({ message: "Invalid email address." }),
});

// Infer the TypeScript type from the schema
export type FormValues = z.infer<typeof formSchema>;

