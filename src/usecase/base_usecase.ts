/**
 * ユースケース: 基底クラス
 *
 * すべてのユースケースが継承すべき抽象クラス
 * - Input型: ユースケースへの入力
 * - Output型: ユースケースからの出力
 */
export abstract class UseCase<I, O> {
  /**
   * ユースケースを実行
   * @param input ユースケースへの入力
   * @returns ユースケースの出力
   */
  abstract execute(input: I): Promise<O>;
}
