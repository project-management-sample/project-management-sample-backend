import express, { Express } from 'express';
import { Pool } from 'pg';
import { MemoController } from '../interface/controllers/memo_controller';
import { AuthController } from '../interface/controllers/auth_controller';
import { MemoRepositoryPostgres } from '../infrastructure/persistence/memo_repository_impl';
import { CreateMemoUseCase } from '../usecase/create_memo_usecase';
import { FindMemosUseCase } from '../usecase/find_memos_usecase';
import { UpdateMemoUseCase } from '../usecase/update_memo_usecase';
import { DeleteMemoUseCase } from '../usecase/delete_memo_usecase';
import {
  authMiddleware,
  errorMiddleware,
  loggingMiddleware,
  validationMiddleware,
} from '../interface/middleware/middleware';

/**
 * Express サーバーの設定
 * 
 * 設計ポイント:
 * - ミドルウェアの登録順序が重要
 * - ルーティングの集約
 * - DI（依存性注入）パターンで上位層に組み立て
 */
export function setupServer(app: Express, pool: Pool): void {
  // ===== ミドルウェアの登録 =====

  // 1. ロギング（最初に）
  app.use(loggingMiddleware);

  // 2. JSONパース
  app.use(express.json());

  // 3. リクエスト検証
  app.use(validationMiddleware);

  // ===== リポジトリの初期化 =====
  const memoRepository = new MemoRepositoryPostgres(pool);

  // ===== ユースケースの初期化 =====
  const createMemoUseCase = new CreateMemoUseCase(memoRepository);
  const findMemosUseCase = new FindMemosUseCase(memoRepository);
  const updateMemoUseCase = new UpdateMemoUseCase(memoRepository);
  const deleteMemoUseCase = new DeleteMemoUseCase(memoRepository);

  // ===== コントローラーの初期化 =====
  const memoController = new MemoController(
    createMemoUseCase,
    findMemosUseCase,
    updateMemoUseCase,
    deleteMemoUseCase
  );
  const authController = new AuthController();

  // ===== ルーティング =====

  // ヘルスチェック（認証不要）
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // 認証API（認証不要）
  app.post('/api/v1/auth/login', (req, res) => authController.login(req, res));
  app.post('/api/v1/auth/refresh', (req, res) => authController.refresh(req, res));

  // メモAPI（認証必須）
  app.post('/api/v1/memos', authMiddleware, (req, res) =>
    memoController.create(req, res)
  );

  app.get('/api/v1/memos', authMiddleware, (req, res) => memoController.list(req, res));

  app.patch('/api/v1/memos/:id', authMiddleware, (req, res) =>
    memoController.update(req, res)
  );

  app.delete('/api/v1/memos/:id', authMiddleware, (req, res) =>
    memoController.delete(req, res)
  );

  // ===== グローバルエラーハンドリング =====
  app.use(errorMiddleware);
}
