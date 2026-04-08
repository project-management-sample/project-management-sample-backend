/**
 * エラークラス: 認証ドメインエラー
 *
 * ビジネスルール違反時に発生
 * これらのエラーは外層で HTTP ステータスコードにマップされる
 */

export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCredentialsError';
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRefreshTokenError';
    Object.setPrototypeOf(this, InvalidRefreshTokenError.prototype);
  }
}

export class AuthValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthValidationError';
    Object.setPrototypeOf(this, AuthValidationError.prototype);
  }
}
