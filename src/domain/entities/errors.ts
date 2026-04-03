/**
 * エラークラス: ドメインエラー
 * 
 * ビジネスルール違反時に発生
 * これらのエラーは外層で HTTP ステータスコードにマップされる
 */

export class InvalidMemoTextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMemoTextError';
    Object.setPrototypeOf(this, InvalidMemoTextError.prototype);
  }
}

export class MemoNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MemoNotFoundError';
    Object.setPrototypeOf(this, MemoNotFoundError.prototype);
  }
}

export class MemoAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MemoAccessDeniedError';
    Object.setPrototypeOf(this, MemoAccessDeniedError.prototype);
  }
}
