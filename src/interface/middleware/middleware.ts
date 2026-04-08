import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';
import {
  InvalidMemoTextError,
  MemoAccessDeniedError,
  MemoNotFoundError,
} from '../../domain/entities/errors';
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  AuthValidationError,
} from '../../domain/entities/auth_errors';
import { logger } from '../../infrastructure/external/logger';

/**
 * JWTの検証済みペイロード
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  iat?: number;
  exp?: number;
}

// Express Request 型を拡張して user フィールドを追加
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * 認証ミドルウェア
 * Authorization ヘッダーの Bearer トークンを検証し、req.user にペイロードをセット
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error_code: 'E002', message: 'トークンが必要です' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error_code: 'E002', message: 'トークンが無効または期限切れです' });
  }
}

/**
 * ロギングミドルウェア
 * すべてのリクエストをログに記録
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  logger.info(`${req.method} ${req.path}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });

  next();
}

/**
 * リクエスト検証ミドルウェア
 * Content-Type の確認など基本的な検証を行う
 */
export function validationMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      res.status(415).json({
        error_code: 'E001',
        message: 'Content-Type は application/json である必要があります',
      });
      return;
    }
  }
  next();
}

/**
 * グローバルエラーハンドリングミドルウェア
 * ドメインエラーを適切な HTTP ステータスコードにマップ
 * リクエストコンテキストをログに含め、デバッグを容易にする
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isExpectedError =
    err instanceof InvalidMemoTextError ||
    err instanceof MemoNotFoundError ||
    err instanceof MemoAccessDeniedError ||
    err instanceof InvalidCredentialsError ||
    err instanceof InvalidRefreshTokenError ||
    err instanceof AuthValidationError;

  logger.error('エラーが発生しました', {
    error: err.message,
    stack: isExpectedError ? undefined : err.stack,
    method: req.method,
    path: req.path,
    userId: req.user?.sub,
  });

  if (err instanceof InvalidMemoTextError) {
    res.status(400).json({ error_code: 'E001', message: err.message });
    return;
  }

  if (err instanceof MemoNotFoundError) {
    res.status(404).json({ error_code: 'E003', message: err.message });
    return;
  }

  if (err instanceof MemoAccessDeniedError) {
    res.status(403).json({ error_code: 'E003', message: err.message });
    return;
  }

  if (err instanceof InvalidCredentialsError) {
    res.status(401).json({ error_code: 'E002', message: err.message });
    return;
  }

  if (err instanceof InvalidRefreshTokenError) {
    res.status(401).json({ error_code: 'E002', message: err.message });
    return;
  }

  if (err instanceof AuthValidationError) {
    res.status(400).json({ error_code: 'E001', message: err.message });
    return;
  }

  // 予期しないエラー（スタックトレースはログ済みのためレスポンスには含めない）
  res.status(500).json({ error_code: 'E999', message: 'サーバー内部エラーが発生しました' });
}
