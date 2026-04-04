import { Memo } from '../../domain/entities/memo';
import { MemoListResponse, MemoResponse } from '../dto/memo_response';

/**
 * Mapper: Memo エンティティ → DTO
 *
 * コントローラーがエンティティを直接JSONに変換するのではなく、
 * Mapperを経由することでAPIレスポンス形式を一元管理する
 */
export class MemoMapper {
  static toResponse(memo: Memo): MemoResponse {
    return {
      id: memo.id,
      text: memo.textValue,
      createdAt: memo.createdAt.toISOString(),
      updatedAt: memo.updatedAt.toISOString(),
    };
  }

  static toListResponse(
    memos: Memo[],
    total: number,
    page: number,
    limit: number
  ): MemoListResponse {
    return {
      data: memos.map((memo) => MemoMapper.toResponse(memo)),
      total,
      page,
      limit,
    };
  }
}
