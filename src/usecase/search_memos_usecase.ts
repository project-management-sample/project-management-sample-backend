import { MemoRepository } from '../domain/repositories/memo_repository';
import { Pagination } from '../domain/value_objects/pagination';
import { logger } from '../infrastructure/external/logger';
import { UseCase } from './base_usecase';
import { FindMemosOutput } from './find_memos_usecase';

/**
 * ユースケース: メモをキーワード検索
 */
export interface SearchMemosInput {
  userId: string;
  keyword: string;
  pagination: Pagination;
}

export class SearchMemosUseCase extends UseCase<SearchMemosInput, FindMemosOutput> {
  constructor(private readonly repository: MemoRepository) {
    super();
  }

  async execute(input: SearchMemosInput): Promise<FindMemosOutput> {
    const { userId, keyword, pagination } = input;
    logger.debug('SearchMemosUseCase: メモ検索開始', { userId, keyword, page: pagination.page, limit: pagination.limit });

    try {
      const result = await this.repository.search(userId, keyword, pagination.page, pagination.limit);
      logger.info('SearchMemosUseCase: メモ検索成功', { userId, keyword, count: result.memos.length });
      return { ...result, page: pagination.page, limit: pagination.limit };
    } catch (error) {
      logger.error('SearchMemosUseCase: エラーが発生', error);
      throw error;
    }
  }
}
