import { InvalidMemoTextError } from '../../domain/entities/errors';

/**
 * Validator: メモAPIの入力検証
 *
 * コントローラー内のバリデーションロジックを分離し、
 * 検証責務を一元管理する
 */
export class MemoValidator {
  static validateCreateInput(body: unknown): { text: string } {
    if (!body || typeof body !== 'object') {
      throw new InvalidMemoTextError('リクエストボディが不正です');
    }

    const { text } = body as Record<string, unknown>;

    if (!text || typeof text !== 'string') {
      throw new InvalidMemoTextError('text は文字列で必須です');
    }

    return { text };
  }

  static validateUpdateInput(body: unknown): { text: string } {
    return MemoValidator.validateCreateInput(body);
  }
}
