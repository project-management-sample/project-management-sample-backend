import { Memo } from '../domain/entities/memo';
import { MemoRepository } from '../domain/repositories/memo_repository';
import {
  InvalidMemoTextError,
  MemoAccessDeniedError,
  MemoNotFoundError,
} from '../domain/entities/errors';
import { logger } from '../infrastructure/external/logger';
import { UseCase } from './base_usecase';

/**
 * ユースケース: メモを更新
 *
 * 責務:
 * 1. メモの存在確認
 * 2. 所有権チェック（アクセス制御）
 * 3. ドメインロジック実行
 * 4. リポジトリで永続化
 */
export interface UpdateMemoInput {
  userId: string;
  memoId: string;
  text: string;
}

export class UpdateMemoUseCase extends UseCase<UpdateMemoInput, Memo> {
  constructor(private readonly repository: MemoRepository) {
    super();
  }

  async execute(input: UpdateMemoInput): Promise<Memo> {
    const { userId, memoId, text } = input;
    logger.debug('UpdateMemoUseCase: メモ更新開始', { userId, memoId });

    try {
      if (!text) {
        throw new InvalidMemoTextError('テキストが必要です');
      }

      // findById → save を同一トランザクション内で実行
      const updatedMemo = await this.repository.withTransaction(async (txRepo) => {
        // 1. メモの存在確認
        const memo = await txRepo.findById(memoId);
        if (!memo) {
          throw new MemoNotFoundError(`メモが見つかりません (ID: ${memoId})`);
        }

        // 2. 所有権チェック
        if (memo.userId !== userId) {
          throw new MemoAccessDeniedError('このメモを更新する権限がありません');
        }

        // 3. ドメインロジックで更新
        const updated = memo.updateText(text);

        // 4. 永続化
        await txRepo.save(updated);
        return updated;
      });

      logger.info('UpdateMemoUseCase: メモを更新', { memoId, userId });
      return updatedMemo;
    } catch (error) {
      logger.error('UpdateMemoUseCase: エラーが発生', error);
      throw error;
    }
  }
}
