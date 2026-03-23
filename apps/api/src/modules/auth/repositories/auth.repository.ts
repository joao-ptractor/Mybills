export interface AuthRepository {
  updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
}
