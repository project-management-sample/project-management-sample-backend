import { Request, Response, NextFunction } from 'express';
import { CreateMemoUseCase } from '../../usecase/create_memo_usecase';
import { FindMemosUseCase } from '../../usecase/find_memos_usecase';
import { SearchMemosUseCase } from '../../usecase/search_memos_usecase';
import { UpdateMemoUseCase } from '../../usecase/update_memo_usecase';
import { DeleteMemoUseCase } from '../../usecase/delete_memo_usecase';
import { Pagination } from '../../domain/value_objects/pagination';
import { MemoMapper } from '../mappers/memo_mapper';
import { MemoValidator } from '../validators/memo_validator';

/**
 * コントローラー: メモ API
 *
 * 責務:
 * - HTTP リクエストの受け取り
 * - Validator による入力検証
 * - ユースケースの呼び出し
 * - Mapper による DTO 変換
 * - HTTP ステータスコードの決定
 * - ドメインエラーは next(err) でグローバルエラーハンドラーへ委譲
 */
export class MemoController {
  constructor(
    private readonly createMemoUseCase: CreateMemoUseCase,
    private readonly findMemosUseCase: FindMemosUseCase,
    private readonly searchMemosUseCase: SearchMemosUseCase,
    private readonly updateMemoUseCase: UpdateMemoUseCase,
    private readonly deleteMemoUseCase: DeleteMemoUseCase
  ) {}

  /**
   * POST /api/v1/memos
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error_code: 'E002', message: '認証が必要です' });
        return;
      }

      const { text } = MemoValidator.validateCreateInput(req.body);
      const memo = await this.createMemoUseCase.execute({ userId, text });

      res.status(201).json(MemoMapper.toResponse(memo));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/memos
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error_code: 'E002', message: '認証が必要です' });
        return;
      }

      const { page, limit, keyword } = MemoValidator.validateListQuery(req.query);
      const pagination = Pagination.create(
        page || Pagination.DEFAULT_PAGE,
        limit || Pagination.DEFAULT_LIMIT
      );

      let result;
      if (keyword && keyword.trim()) {
        result = await this.searchMemosUseCase.execute({
          userId,
          keyword: keyword.trim(),
          pagination,
        });
      } else {
        result = await this.findMemosUseCase.execute({ userId, pagination });
      }

      res.status(200).json(
        MemoMapper.toListResponse(result.memos, result.total, result.page, result.limit)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/memos/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error_code: 'E002', message: '認証が必要です' });
        return;
      }

      const { id } = req.params;
      const { text } = MemoValidator.validateUpdateInput(req.body);
      const memo = await this.updateMemoUseCase.execute({ userId, memoId: id, text });

      res.status(200).json(MemoMapper.toResponse(memo));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/memos/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error_code: 'E002', message: '認証が必要です' });
        return;
      }

      const { id } = req.params;
      await this.deleteMemoUseCase.execute({ userId, memoId: id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
