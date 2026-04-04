import { Memo } from '../entities/memo';

/**
 * リポジトリインターフェース: MemoRepository
 * 
 * 設計ポイント:
 * - このインターフェースはドメイン層で定義
 * - 実装（PostgreSQL等）はインフラストラクチャ層で行う
 * - これにより、ドメインロジックが外部フレームワークに依存しない
 * 
 * 学習ポイント: 依存性の逆転（Dependency Inversion Principle）
 * - ドメイン層がインフラ層に依存しない
 * - インフラ層がドメイン層のインターフェースを実装
 */
export interface MemoRepository {
  /**
   * メモを保存（新規作成 or 更新）
   * @param memo 保存対象のメモエンティティ
   * @throws エラーが発生した場合
   */
  save(memo: Memo): Promise<void>;

  /**
   * IDでメモを検索
   * @param id メモID
   * @returns メモが見つかった場合はMemoインスタンス、見つからない場合はnull
   */
  findById(id: string): Promise<Memo | null>;

  /**
   * ユーザーのメモ一覧を取得（ページネーション対応）
   */
  findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ memos: Memo[]; total: number }>;

  /**
   * メモをキーワード検索
   */
  search(
    userId: string,
    keyword: string,
    page: number,
    limit: number
  ): Promise<{ memos: Memo[]; total: number }>;

  /**
   * メモを削除（物理削除）
   */
  delete(id: string): Promise<void>;

  /**
   * トランザクション内で処理を実行
   * BEGIN/COMMIT/ROLLBACKを自動管理する
   */
  withTransaction<T>(fn: (repo: MemoRepository) => Promise<T>): Promise<T>;
}
