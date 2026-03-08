import axios from 'axios';
import type { LoginResponse, UserInfo } from './types';
import { apiClient } from '../../shared/api/apiClient';

const BASE = 'http://localhost:8080/api';

export async function login(username: string, password: string): Promise<LoginResponse> {
    const res = await axios.post<LoginResponse>(`${BASE}/auth/login`, { username, password });
    return res.data;
}

export async function register(username: string, password: string, email: string): Promise<LoginResponse> {
    const res = await axios.post<LoginResponse>(`${BASE}/auth/register`, { username, password, email });
    return res.data;
}

export async function logout(refreshToken: string): Promise<void> {
    await axios.post(`${BASE}/auth/logout`, { refreshToken });
}

export async function getMe(): Promise<UserInfo> {
    const res = await apiClient.get<UserInfo>('/auth/me');
    return res.data;
}
