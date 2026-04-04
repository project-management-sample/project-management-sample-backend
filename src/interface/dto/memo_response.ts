/**
 * DTO: メモレスポンス
 *
 * エンティティを直接返すのではなく、APIレスポンスの形式を明示的に定義する
 */
export interface MemoResponse {
  id: string;
  text: string;
  createdAt: string; // ISO8601形式に統一
  updatedAt: string; // ISO8601形式に統一
}

export interface MemoListResponse {
  data: MemoResponse[];
  total: number;
  page: number;
  limit: number;
}
