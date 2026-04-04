import { Memo } from '../domain/entities/memo';
import { MemoRepository } from '../domain/repositories/memo_repository';
import { Pagination } from '../domain/value_objects/pagination';
import { logger } from '../infrastructure/external/logger';
import { UseCase } from './base_usecase';

/**
 * ユースケース: メモ一覧を取得
 */
export interface FindMemosInput {
  userId: string;
  pagination: Pagination;
}

export interface FindMemosOutput {
  memos: Memo[];
  total: number;
  page: number;
  limit: number;
}

export class FindMemosUseCase extends UseCase<FindMemosInput, FindMemosOutput> {
  constructor(private readonly repository: MemoRepository) {
    super();
  }

  async execute(input: FindMemosInput): Promise<FindMemosOutput> {
    const { userId, pagination } = input;
    logger.debug('FindMemosUseCase: メモ一覧取得開始', { userId, page: pagination.page, limit: pagination.limit });

    try {
      const result = await this.repository.findByUserId(userId, pagination.page, pagination.limit);
      logger.info('FindMemosUseCase: メモ一覧取得成功', { userId, count: result.memos.length, total: result.total });
      return { ...result, page: pagination.page, limit: pagination.limit };
    } catch (error) {
      logger.error('FindMemosUseCase: エラーが発生', error);
      throw error;
    }
  }
}
