import { Pool } from 'pg';
import { Memo } from '../../domain/entities/memo';
import { MemoRepository } from '../../domain/repositories/memo_repository';
import { MemoText } from '../../domain/value_objects/memo_text';
import { MemoNotFoundError } from '../../domain/entities/errors';

/**
 * リポジトリ実装: PostgreSQL版
 * 
 * 設計ポイント:
 * - ドメイン層で定義されたインターフェースを実装
 * - SQL操作はここに集約
 * - ドメインオブジェクトへの変換はここで実施
 * 
 * 学習ポイント:
 * - インターフェース分離: ドメイン層はこの具体的な実装を知らない
 * - テスト時はモックで置き換え可能
 */
export class MemoRepositoryPostgres implements MemoRepository {
  constructor(private readonly pool: Pool) {}

  async save(memo: Memo): Promise<void> {
    const query = `
      INSERT INTO memos (id, user_id, text, created_at, updated_at, deleted_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        text = EXCLUDED.text,
        updated_at = EXCLUDED.updated_at,
        deleted_at = EXCLUDED.deleted_at
    `;

    try {
      await this.pool.query(query, [
        memo.id,
        memo.userId,
        memo.textValue,
        memo.createdAt,
        memo.updatedAt,
        memo.deletedAt,
      ]);
    } catch (error) {
      throw new Error(`メモの保存に失敗しました: ${error}`);
    }
  }

  async findById(id: string): Promise<Memo | null> {
    const query = `
      SELECT id, user_id, text, created_at, updated_at, deleted_at
      FROM memos
      WHERE id = $1 AND deleted_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new Memo(
        row.id,
        row.user_id,
        MemoText.create(row.text),
        row.created_at,
        row.updated_at,
        row.deleted_at
      );
    } catch (error) {
      throw new Error(`メモの検索に失敗しました: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ memos: Memo[]; total: number }> {
    const offset = (page - 1) * limit;

    const queryTotal = `SELECT COUNT(*) FROM memos WHERE user_id = $1 AND deleted_at IS NULL`;
    const queryMemos = `
      SELECT id, user_id, text, created_at, updated_at, deleted_at
      FROM memos
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const resultTotal = await this.pool.query(queryTotal, [userId]);
      const total = parseInt(resultTotal.rows[0].count, 10);

      const resultMemos = await this.pool.query(queryMemos, [userId, limit, offset]);
      const memos = resultMemos.rows.map(
        (row) =>
          new Memo(
            row.id,
            row.user_id,
            MemoText.create(row.text),
            row.created_at,
            row.updated_at,
            row.deleted_at
          )
      );

      return { memos, total };
    } catch (error) {
      throw new Error(`メモ一覧の取得に失敗しました: ${error}`);
    }
  }

  async search(
    userId: string,
    keyword: string,
    page: number,
    limit: number
  ): Promise<{ memos: Memo[]; total: number }> {
    const offset = (page - 1) * limit;
    const searchKeyword = `%${keyword}%`;

    const queryTotal = `
      SELECT COUNT(*) FROM memos
      WHERE user_id = $1 AND text ILIKE $2 AND deleted_at IS NULL
    `;
    const queryMemos = `
      SELECT id, user_id, text, created_at, updated_at, deleted_at
      FROM memos
      WHERE user_id = $1 AND text ILIKE $2 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `;

    try {
      const resultTotal = await this.pool.query(queryTotal, [userId, searchKeyword]);
      const total = parseInt(resultTotal.rows[0].count, 10);

      const resultMemos = await this.pool.query(queryMemos, [
        userId,
        searchKeyword,
        limit,
        offset,
      ]);
      const memos = resultMemos.rows.map(
        (row) =>
          new Memo(
            row.id,
            row.user_id,
            MemoText.create(row.text),
            row.created_at,
            row.updated_at,
            row.deleted_at
          )
      );

      return { memos, total };
    } catch (error) {
      throw new Error(`メモの検索に失敗しました: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    const query = `DELETE FROM memos WHERE id = $1`;

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rowCount === 0) {
        throw new MemoNotFoundError(`メモが見つかりません (ID: ${id})`);
      }
    } catch (error) {
      throw new Error(`メモの削除に失敗しました: ${error}`);
    }
  }
}
