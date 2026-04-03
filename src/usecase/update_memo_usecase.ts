import { Memo } from '../domain/entities/memo';
import { MemoRepository } from '../domain/repositories/memo_repository';
import {
  InvalidMemoTextError,
  MemoAccessDeniedError,
  MemoNotFoundError,
} from '../domain/entities/errors';
import { logger } from '../infrastructure/external/logger';

/**
 * ユースケース: メモを更新
 *
 * 責務:
 * 1. メモの存在確認
 * 2. 所有権チェック（アクセス制御）
 * 3. ドメインロジック実行
 * 4. リポジトリで永続化
 */
export class UpdateMemoUseCase {
  constructor(private readonly repository: MemoRepository) {}

  async execute(userId: string, memoId: string, text: string): Promise<Memo> {
    logger.debug('UpdateMemoUseCase: メモ更新開始', { userId, memoId });

    try {
      if (!text) {
        throw new InvalidMemoTextError('テキストが必要です');
      }

      // 1. メモの存在確認
      const memo = await this.repository.findById(memoId);
      if (!memo) {
        throw new MemoNotFoundError(`メモが見つかりません (ID: ${memoId})`);
      }

      // 2. 所有権チェック
      if (memo.userId !== userId) {
        throw new MemoAccessDeniedError('このメモを更新する権限がありません');
      }

      // 3. ドメインロジックで更新
      const updatedMemo = memo.updateText(text);

      // 4. 永続化
      await this.repository.save(updatedMemo);
      logger.info('UpdateMemoUseCase: メモを更新', { memoId, userId });

      return updatedMemo;
    } catch (error) {
      logger.error('UpdateMemoUseCase: エラーが発生', error);
      throw error;
    }
  }
}
