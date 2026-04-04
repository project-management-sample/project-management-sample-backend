import { Pool, PoolClient } from 'pg';

/**
 * トランザクション管理ユーティリティ
 *
 * BEGIN/COMMIT/ROLLBACKを自動管理し、複数のDB操作を原子的に実行する
 */
export async function withTransaction<T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
