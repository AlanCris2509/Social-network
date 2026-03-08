export interface UserInfo {
    id: number;
    username: string;
    email: string;
    role: 'ADMIN' | 'USER';
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserInfo;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface ApiError {
    status: number;
    error: string;
    message: string;
    timestamp: string;
}
