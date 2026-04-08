import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../usecase/login_usecase';
import { RefreshTokenUseCase } from '../../usecase/refresh_token_usecase';
import { AuthValidator } from '../validators/auth_validator';

/**
 * コントローラー: 認証 API
 *
 * エンドポイント:
 * - POST /api/v1/auth/login   - ログイン（JWTを発行）
 * - POST /api/v1/auth/refresh - アクセストークンの更新
 */
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  /**
   * POST /api/v1/auth/login
   * メールアドレスとパスワードで認証し、JWT トークンを返す
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = AuthValidator.validateLogin(req.body);
      const output = await this.loginUseCase.execute(input);
      res.status(200).json(output);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * リフレッシュトークンを使って新しいアクセストークンを発行
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = AuthValidator.validateRefresh(req.body);
      const output = await this.refreshTokenUseCase.execute(input);
      res.status(200).json(output);
    } catch (error) {
      next(error);
    }
  }
}
