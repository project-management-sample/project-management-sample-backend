import { z } from 'zod';
import { AuthValidationError } from '../../domain/entities/auth_errors';

/**
 * 認証API用バリデーター
 *
 * zod スキーマを使った型安全なバリデーション
 */

const LoginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードが必要です'),
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'リフレッシュトークンが必要です'),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || 'リクエストボディが不正です';
  }
  return 'リクエストボディが不正です';
}

export class AuthValidator {
  static validateLogin(body: unknown): { email: string; password: string } {
    try {
      return LoginSchema.parse(body);
    } catch (error) {
      throw new AuthValidationError(getErrorMessage(error));
    }
  }

  static validateRefresh(body: unknown): { refreshToken: string } {
    try {
      return RefreshSchema.parse(body);
    } catch (error) {
      throw new AuthValidationError(getErrorMessage(error));
    }
  }
}
