import { EmailSchema } from './emailModel.js';
import { sendEmail } from './emailService.js';

export const handleSendEmail = async (req, res) => {
  try {
    // 1. Validate request payload using Model
    const validatedData = EmailSchema.parse(req.body);

    // 2. Call Service layer
    const result = await sendEmail(validatedData);

    // 3. Return HTTP response
    return res.status(200).json({
      success: true,
      message: 'Email dispatched successfully',
      data: result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while sending email',
    });
  }
};