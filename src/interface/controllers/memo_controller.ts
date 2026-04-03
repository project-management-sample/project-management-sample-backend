import { Request, Response } from 'express';
import { CreateMemoUseCase } from '../../usecase/create_memo_usecase';
import { FindMemosUseCase } from '../../usecase/find_memos_usecase';
import { UpdateMemoUseCase } from '../../usecase/update_memo_usecase';
import { DeleteMemoUseCase } from '../../usecase/delete_memo_usecase';
import {
  InvalidMemoTextError,
  MemoAccessDeniedError,
  MemoNotFoundError,
} from '../../domain/entities/errors';
import { logger } from '../../infrastructure/external/logger';

/**
 * コントローラー: メモ API
 *
 * 責務:
 * - HTTP リクエストの受け取り
 * - 入力値のフォーマット検証（軽微）
 * - ユースケースの呼び出し
 * - レスポンス形式の構築
 * - HTTP ステータスコードの決定
 */
export class MemoController {
  constructor(
    private readonly createMemoUseCase: CreateMemoUseCase,
    private readonly findMemosUseCase: FindMemosUseCase,
    private readonly updateMemoUseCase: UpdateMemoUseCase,
    private readonly deleteMemoUseCase: DeleteMemoUseCase
  ) {}

  /**
   * POST /api/v1/memos
   * メモを作成する
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error_code: 'E002', message: '認証が必要です' });
        return;
      }

      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({
          error_code: 'E001',
          message: '入力値が不正です',
          details: { field: 'text', reason: '1-1000文字で入力してください' },
        });
        return;
      }

      const memo = await this.createMemoUseCase.execute(userId, text);

      res.status(201).json({
        id: memo.id,
        text: memo.textValue,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /api/v1/memos
   * メモ一覧を取得する（ページネーション・キーワード検索対応）
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error_code: 'E002', message: '認証が必要です' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const keyword = req.query.keyword as string | undefined;

      let result;
      if (keyword && keyword.trim()) {
        result = await this.findMemosUseCase.search(userId, keyword.trim(), page, limit);
      } else {
        result = await this.findMemosUseCase.execute(userId, page, limit);
      }

      res.status(200).json({
        data: result.memos.map((memo) => ({
          id: memo.id,
          text: memo.textValue,
          createdAt: memo.createdAt,
          updatedAt: memo.updatedAt,
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PATCH /api/v1/memos/:id
   * メモを更新する
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error_code: 'E002', message: '認証が必要です' });
        return;
      }

      const { id } = req.params;
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({
          error_code: 'E001',
          message: '入力値が不正です',
          details: { field: 'text', reason: '1-1000文字で入力してください' },
        });
        return;
      }

      const memo = await this.updateMemoUseCase.execute(userId, id, text);

      res.status(200).json({
        id: memo.id,
        text: memo.textValue,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /api/v1/memos/:id
   * メモを削除する
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error_code: 'E002', message: '認証が必要です' });
        return;
      }

      const { id } = req.params;

      await this.deleteMemoUseCase.execute(userId, id);

      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * エラーを HTTP レスポンスにマップ
   */
  private handleError(error: unknown, res: Response): void {
    logger.error('MemoController: エラーが発生', error as Error);

    if (error instanceof InvalidMemoTextError) {
      res.status(400).json({ error_code: 'E001', message: error.message });
      return;
    }

    if (error instanceof MemoNotFoundError) {
      res.status(404).json({ error_code: 'E003', message: error.message });
      return;
    }

    if (error instanceof MemoAccessDeniedError) {
      res.status(403).json({ error_code: 'E003', message: error.message });
      return;
    }

    res.status(500).json({ error_code: 'E999', message: 'サーバー内部エラーが発生しました' });
  }
}
