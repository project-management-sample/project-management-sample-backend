/**
 * 値オブジェクト: Pagination
 *
 * ページネーション情報をカプセル化し、バリデーションと計算を一元管理する
 */
export class Pagination {
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 20;
  static readonly MAX_LIMIT = 100;

  private constructor(
    readonly page: number,
    readonly limit: number,
    readonly offset: number
  ) {}

  static create(page: number, limit: number): Pagination {
    const validPage = Math.max(1, Math.floor(page) || Pagination.DEFAULT_PAGE);
    const validLimit = Math.min(
      Math.max(1, Math.floor(limit) || Pagination.DEFAULT_LIMIT),
      Pagination.MAX_LIMIT
    );
    const offset = (validPage - 1) * validLimit;

    return new Pagination(validPage, validLimit, offset);
  }
}
