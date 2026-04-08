import { z } from 'zod';
import { InvalidMemoTextError } from '../../domain/entities/errors';
import { Pagination } from '../../domain/value_objects/pagination';

/**
 * Validator: メモAPIの入力検証
 *
 * zod スキーマを使った型安全なバリデーション
 */

const CreateMemoSchema = z.object({
  text: z.string().min(1, 'テキストは1文字以上必須です').max(1000, 'テキストは1000文字以下です'),
});

const ListQuerySchema = z.object({
  page: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (!val) return undefined;
    const num = typeof val === 'string' ? parseInt(val) : val;
    return Number.isInteger(num) && num > 0 ? num : undefined;
  }),
  limit: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (!val) return undefined;
    const num = typeof val === 'string' ? parseInt(val) : val;
    return Number.isInteger(num) && num > 0 ? num : undefined;
  }),
  keyword: z.string().optional(),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || '入力が不正です';
  }
  return '入力が不正です';
}

export class MemoValidator {
  static validateCreateInput(body: unknown): { text: string } {
    try {
      return CreateMemoSchema.parse(body);
    } catch (error) {
      throw new InvalidMemoTextError(getErrorMessage(error));
    }
  }

  static validateUpdateInput(body: unknown): { text: string } {
    return MemoValidator.validateCreateInput(body);
  }

  static validateListQuery(query: unknown): {
    page?: number;
    limit?: number;
    keyword?: string;
  } {
    try {
      return ListQuerySchema.parse(query);
    } catch (error) {
      throw new InvalidMemoTextError(getErrorMessage(error));
    }
  }
}
