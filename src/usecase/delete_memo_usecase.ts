import { MemoRepository } from '../domain/repositories/memo_repository';
import { MemoAccessDeniedError, MemoNotFoundError } from '../domain/entities/errors';
import { logger } from '../infrastructure/external/logger';

/**
 * ユースケース: メモを削除
 *
 * 責務:
 * 1. メモの存在確認
 * 2. 所有権チェック（アクセス制御）
 * 3. リポジトリで削除
 */
export class DeleteMemoUseCase {
  constructor(private readonly repository: MemoRepository) {}

  async execute(userId: string, memoId: string): Promise<void> {
    logger.debug('DeleteMemoUseCase: メモ削除開始', { userId, memoId });

    try {
      // 1. メモの存在確認
      const memo = await this.repository.findById(memoId);
      if (!memo) {
        throw new MemoNotFoundError(`メモが見つかりません (ID: ${memoId})`);
      }

      // 2. 所有権チェック
      if (memo.userId !== userId) {
        throw new MemoAccessDeniedError('このメモを削除する権限がありません');
      }

      // 3. 削除（物理削除）
      await this.repository.delete(memoId);
      logger.info('DeleteMemoUseCase: メモを削除', { memoId, userId });
    } catch (error) {
      logger.error('DeleteMemoUseCase: エラーが発生', error);
      throw error;
    }
  }
}
