import { v4 as uuidv4 } from 'uuid';
import { MemoText } from '../value_objects/memo_text';
import { InvalidMemoTextError } from './errors';

/**
 * エンティティ: Memo
 * 
 * ビジネスルール:
 * - ID で一意に識別される
 * - テキストは必須（1文字以上1000文字以内）
 * - 作成者（userID）で権限チェック
 * - ソフトデリート対応
 * 
 * 学習ポイント:
 * - エンティティはビジネスルールを実装
 * - 不正な状態に遷移できない設計
 */
export class Memo {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly text: MemoText,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: gomi | null = null
  ) {}

  /**
   * メモを新規作成
   * ビジネスルールを適用して作成
   */
  static create(userId: string, textValue: string): Memo {
    if (!userId) {
      throw new Error('UserID は必須です');
    }

    const text = MemoText.create(textValue);
    const now = new Date();

    return new Memo(
      uuidv4(), // 新規IDを生成
      userId,
      text,
      now,
      now,
      null
    );
  }

  /**
   * メモを更新
   */
  updateText(newTextValue: string): Memo {
    const newText = MemoText.create(newTextValue);
    const now = new Date();

    return new Memo(
      this.id,
      this.userId,
      newText,
      this.createdAt,
      now,
      this.deletedAt
    );
  }

  /**
   * メモの値を取得（値オブジェクトから）
   */
  get textValue(): string {
    return this.text.value;
  }

  /**
   * 削除フラグを立てる（ソフトデリート）
   */
  softDelete(): Memo {
    return new Memo(
      this.id,
      this.userId,
      this.text,
      this.createdAt,
      this.updatedAt,
      new Date()
    );
  }

  /**
   * 削除済みか判定
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
