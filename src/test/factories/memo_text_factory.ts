import { MemoText } from '../../domain/value_objects/memo_text';

/**
 * テスト用Factory: MemoText
 *
 * テストコードでMemoTextインスタンスを簡単に生成するためのファクトリ
 */
export class MemoTextFactory {
  static create(text?: string): MemoText {
    return MemoText.create(text ?? 'テスト用テキスト');
  }

  static createAtMaxLength(): MemoText {
    return MemoText.create('あ'.repeat(1000));
  }

  static createAtMinLength(): MemoText {
    return MemoText.create('あ');
  }
}
