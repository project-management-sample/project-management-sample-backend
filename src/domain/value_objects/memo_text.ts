import { InvalidMemoTextError } from '../entities/errors';

/**
 * 値オブジェクト: MemoText
 * 
 * 特徴:
 * - 不変（immutable）
 * - ビジネスルール検証を含む
 * - テキストの妥当性を保証
 * 
 * 学習ポイント:
 * - 値オブジェクトは同等性で比較（ID ではなく値で比較）
 * - 一度作成されたら変更できない
 */
export class MemoText {
  private constructor(private readonly _value: string) {
    this.validate();
  }

  /**
   * 値オブジェクトを作成
   * バリデーションをここで実施
   */
  static create(text: string): MemoText {
    return new MemoText(text);
  }

  /**
   * テキストの値を取得
   */
  get value(): string {
    return this._value;
  }

  /**
   * ビジネスルール検証
   */
  private validate(): void {
    // ルール1: 必須
    if (!this._value || this._value.trim().length === 0) {
      throw new InvalidMemoTextError('メモのテキストは必須です');
    }

    // ルール2: 1文字以上
    if (this._value.length < 1) {
      throw new InvalidMemoTextError('メモは1文字以上である必要があります');
    }

    // ルール3: 1000文字以内
    if (this._value.length > 1000) {
      throw new InvalidMemoTextError('メモは1000文字以内である必要があります');
    }
  }

  /**
   * 長さを取得
   */
  get length(): number {
    return this._value.length;
  }

  /**
   * 同等性比較（値オブジェクトは値で比較）
   */
  equals(other: MemoText): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列化
   */
  toString(): string {
    return this._value;
  }
}
