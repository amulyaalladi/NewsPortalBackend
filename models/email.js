import { z } from 'zod';

/**
 * Validation schema for email payloads
 */
export const EmailSchema = z.object({
  to: z.string().email({ message: 'Invalid recipient email address' }),
  subject: z.string().min(1, { message: 'Subject line cannot be empty' }),
  text: z.string().optional(),
  html: z.string().optional(),
}).refine((data) => data.text || data.html, {
  message: 'At least one content format (text or html) must be provided',
  path: ['text'],
});