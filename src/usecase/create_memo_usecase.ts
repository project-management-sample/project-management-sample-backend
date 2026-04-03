import { Memo } from '../domain/entities/memo';
import { MemoRepository } from '../domain/repositories/memo_repository';
import { InvalidMemoTextError } from '../domain/entities/errors';
import { logger } from '../infrastructure/external/logger';

/**
 * ユースケース: メモを作成
 * 
 * 責務：
 * 1. 入力値の詳細バリデーション
 * 2. ドメインロジック実行（Memo.create）
 * 3. リポジトリで永続化
 * 4. イベント発行指示（将来実装）
 */
export class CreateMemoUseCase {
  constructor(private readonly repository: MemoRepository) {}

  async execute(userId: string, text: string): Promise<Memo> {
    logger.debug('CreateMemoUseCase: ユーザーがメモ作成を開始', { userId });

    try {
      // 1. ユースケースレベルのバリデーション
      if (!userId) {
        throw new Error('ユーザーIDが必要です');
      }

      if (!text) {
        throw new InvalidMemoTextError('テキストが必要です');
      }

      // 2. ドメインロジック実行（バリデーション含む）
      const memo = Memo.create(userId, text);
      logger.debug('CreateMemoUseCase: メモをドメインで作成', { memoId: memo.id });

      // 3. リポジトリで永続化
      await this.repository.save(memo);
      logger.info('CreateMemoUseCase: メモを保存', { memoId: memo.id, userId });

      // 4. イベント発行（将来実装）
      // await this.eventPublisher.publish(new MemoCreatedEvent(memo));

      return memo;
    } catch (error) {
      logger.error('CreateMemoUseCase: エラーが発生', error);
      throw error;
    }
  }
}
