import { Memo } from '../../domain/entities/memo';

/**
 * テスト用Factory: Memo
 *
 * テストコードでMemoインスタンスを簡単に生成するためのファクトリ
 * デフォルト値を持ち、必要な箇所だけ上書き可能
 */
export class MemoFactory {
  static create(overrides?: Partial<{ userId: string; text: string }>): Memo {
    return Memo.create(
      overrides?.userId ?? 'user-test-001',
      overrides?.text ?? 'テスト用メモ'
    );
  }

  static createMany(
    count: number,
    overrides?: Partial<{ userId: string; text: string }>
  ): Memo[] {
    return Array.from({ length: count }, (_, i) =>
      MemoFactory.create({
        ...overrides,
        text: overrides?.text ?? `テスト用メモ ${i + 1}`,
      })
    );
  }
}
