import express from 'express';
import 'dotenv/config';
import { config } from './config/config';
import { dbConnection } from './infrastructure/persistence/db_connection';
import { setupServer } from './config/server';
import { logger } from './infrastructure/external/logger';

/**
 * メインエントリーポイント
 * 
 * 処理フロー:
 * 1. 環境変数を読み込み
 * 2. DBに接続
 * 3. Expressサーバーを設定
 * 4. ポート待機開始
 */
async function main() {
  try {
    logger.info('アプリケーション起動', {
      nodeEnv: config.server.nodeEnv,
      port: config.server.port,
    });

    // 1. DB接続
    logger.info('データベース接続中...');
    const pool = await dbConnection.connect();

    // 2. Expressアプリを作成
    const app = express();

    // 3. サーバーを設定
    setupServer(app, pool);

    // 4. ポートで待機
    app.listen(config.server.port, () => {
      logger.info(`サーバーが起動しました - ポート: ${config.server.port}`);
      logger.info(`URL: http://localhost:${config.server.port}`);
      logger.info('ヘルスチェック: http://localhost:3000/health');
    });

    // グレースフルシャットダウン
    process.on('SIGTERM', async () => {
      logger.info('SIGTERMを受信しました');
      await dbConnection.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINTを受信しました');
      await dbConnection.disconnect();
      process.exit(0);
    });
  } catch (error) {
    logger.error('アプリケーション起動エラー', error as Error);
    process.exit(1);
  }
}

// アプリケーション起動
main();
