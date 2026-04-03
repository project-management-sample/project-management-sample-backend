import { Pool } from 'pg';
import { config } from '../../config/config';
import { logger } from '../external/logger';

/**
 * データベース接続管理
 */
export const dbConnection = {
  pool: null as Pool | null,

  async connect(): Promise<Pool> {
    try {
      const pool = new Pool({
        user: config.database.user,
        password: config.database.password,
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // 接続テスト
      const client = await pool.connect();
      logger.info('データベース接続成功');
      client.release();

      this.pool = pool;
      return pool;
    } catch (error) {
      logger.error('データベース接続エラー', error);
      throw error;
    }
  },

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('データベース接続を切断しました');
    }
  },
};
