import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';
import { logger } from '../../infrastructure/external/logger';
import { JwtPayload } from '../middleware/middleware';

/**
 * デモ用ユーザー（学習目的のハードコード）
 * 実際の本番環境では DB から取得し、パスワードはハッシュ化して比較する
 */
const DEMO_USERS: Array<{ id: string; email: string; password: string }> = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'demo@example.com',
    password: 'password',
  },
];

/**
 * コントローラー: 認証 API
 *
 * エンドポイント:
 * - POST /api/v1/auth/login   - ログイン（JWTを発行）
 * - POST /api/v1/auth/refresh - アクセストークンの更新
 */
export class AuthController {
  /**
   * POST /api/v1/auth/login
   * メールアドレスとパスワードで認証し、JWT トークンを返す
   */
  login(req: Request, res: Response): void {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error_code: 'E001', message: 'メールアドレスとパスワードが必要です' });
        return;
      }

      // ユーザー検索（デモ実装）
      const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
      if (!user) {
        res.status(401).json({ error_code: 'E002', message: 'メールアドレスまたはパスワードが間違っています' });
        return;
      }

      const payload: JwtPayload = { sub: user.id, email: user.email };

      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: '15m',
      });

      const refreshToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: '7d',
      });

      logger.info('AuthController: ログイン成功', { userId: user.id });

      res.status(200).json({
        accessToken,
        refreshToken,
        expiresIn: 900, // 15分 = 900秒
      });
    } catch (error) {
      logger.error('AuthController: ログインエラー', error as Error);
      res.status(500).json({ error_code: 'E999', message: 'サーバー内部エラーが発生しました' });
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * リフレッシュトークンを使って新しいアクセストークンを発行
   */
  refresh(req: Request, res: Response): void {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error_code: 'E001', message: 'リフレッシュトークンが必要です' });
        return;
      }

      const decoded = jwt.verify(refreshToken, config.jwt.secret) as JwtPayload;

      const payload: JwtPayload = { sub: decoded.sub, email: decoded.email };
      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: '15m',
      });

      logger.info('AuthController: トークン更新成功', { userId: decoded.sub });

      res.status(200).json({
        accessToken,
        expiresIn: 900,
      });
    } catch {
      res.status(401).json({ error_code: 'E002', message: 'リフレッシュトークンが無効または期限切れです' });
    }
  }
}
