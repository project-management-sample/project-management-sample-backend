import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../infrastructure/external/logger';
import { InvalidRefreshTokenError } from '../domain/entities/auth_errors';
import { UseCase } from './base_usecase';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  expiresIn: number;
}

export class RefreshTokenUseCase extends UseCase<RefreshTokenInput, RefreshTokenOutput> {
  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    logger.debug('RefreshTokenUseCase: トークンリフレッシュを開始します');

    try {
      // リフレッシュトークンを検証・デコード
      const decoded = jwt.verify(input.refreshToken, config.jwt.secret) as JwtPayload;

      // 新しいアクセストークンを発行
      const payload = { sub: decoded.sub, email: decoded.email };
      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: '15m',
      });

      logger.info('RefreshTokenUseCase: トークンリフレッシュ成功', { userId: decoded.sub });

      return {
        accessToken,
        expiresIn: 900, // 15分 = 900秒
      };
    } catch (error) {
      logger.error('RefreshTokenUseCase: トークンリフレッシュエラー', error as Error);
      throw new InvalidRefreshTokenError('リフレッシュトークンが無効または期限切れです');
    }
  }
}
