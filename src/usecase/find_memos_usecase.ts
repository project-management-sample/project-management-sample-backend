import { Memo } from '../domain/entities/memo';
import { MemoRepository } from '../domain/repositories/memo_repository';
import { logger } from '../infrastructure/external/logger';

/**
 * ユースケース: メモ一覧を取得
 */
export class FindMemosUseCase {
  constructor(private readonly repository: MemoRepository) {}

  async execute(userId: string, page: number, limit: number): Promise<{ memos: Memo[]; total: number; page: number; limit: number }> {
    logger.debug('FindMemosUseCase: メモ一覧取得開始', { userId, page, limit });

    try {
      const result = await this.repository.findByUserId(userId, page, limit);
      logger.info('FindMemosUseCase: メモ一覧取得成功', { userId, count: result.memos.length, total: result.total });
      return { ...result, page, limit };
    } catch (error) {
      logger.error('FindMemosUseCase: エラーが発生', error);
      throw error;
    }
  }

  async search(userId: string, keyword: string, page: number, limit: number): Promise<{ memos: Memo[]; total: number; page: number; limit: number }> {
    logger.debug('FindMemosUseCase: メモ検索開始', { userId, keyword, page, limit });

    try {
      const result = await this.repository.search(userId, keyword, page, limit);
      logger.info('FindMemosUseCase: メモ検索成功', { userId, keyword, count: result.memos.length });
      return { ...result, page, limit };
    } catch (error) {
      logger.error('FindMemosUseCase: エラーが発生', error);
      throw error;
    }
  }
}
