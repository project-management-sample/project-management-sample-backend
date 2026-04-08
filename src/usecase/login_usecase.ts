import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../infrastructure/external/logger';
import { UserRepository } from '../domain/repositories/user_repository';
import { InvalidCredentialsError } from '../domain/entities/auth_errors';
import { UseCase } from './base_usecase';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class LoginUseCase extends UseCase<LoginInput, LoginOutput> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(input: LoginInput): Promise<LoginOutput> {
    logger.debug('LoginUseCase: ログイン処理を開始します', { email: input.email });

    try {
      // ユーザー検索
      const user = await this.userRepository.findByEmailAndPassword(input.email, input.password);
      if (!user) {
        throw new InvalidCredentialsError('メールアドレスまたはパスワードが間違っています');
      }

      // JWTペイロードを構築
      const payload = { sub: user.id, email: user.email };

      // アクセストークン（15分）を発行
      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: '15m',
      });

      // リフレッシュトークン（7日）を発行
      const refreshToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: '7d',
      });

      logger.info('LoginUseCase: ログイン成功', { userId: user.id });

      return {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15分 = 900秒
      };
    } catch (error) {
      logger.error('LoginUseCase: ログインエラー', error as Error);
      throw error;
    }
  }
}
