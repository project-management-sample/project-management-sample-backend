/**
 * ユーザーリポジトリ
 *
 * ユーザー情報の永続化層インターフェース
 */

export interface UserRepository {
  findByEmailAndPassword(email: string, password: string): Promise<{ id: string; email: string } | null>;
}

/**
 * インメモリユーザーリポジトリ（デモ実装）
 * 実際の本番環境では PostgresUserRepository に差し替えられる
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users: Array<{ id: string; email: string; password: string }> = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@example.com',
      password: 'password',
    },
  ];

  async findByEmailAndPassword(email: string, password: string): Promise<{ id: string; email: string } | null> {
    const user = this.users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return null;
    }
    return { id: user.id, email: user.email };
  }
}
