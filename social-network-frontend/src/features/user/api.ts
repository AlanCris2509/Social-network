import type { UserDto, AdminUserDto, CreateUserRequest, UpdateUserRequest } from './types';
import { apiClient } from '../../shared/api/apiClient';

export async function getUsers(): Promise<UserDto[]> {
    const res = await apiClient.get<UserDto[]>('/users');
    return res.data;
}

export async function getAdmins(): Promise<AdminUserDto[]> {
    const res = await apiClient.get<AdminUserDto[]>('/admin/admins');
    return res.data;
}

export async function createUser(data: CreateUserRequest): Promise<UserDto> {
    const res = await apiClient.post<UserDto>('/admin/users', data);
    return res.data;
}

export async function updateUser(id: number, data: UpdateUserRequest): Promise<UserDto> {
    const res = await apiClient.put<UserDto>(`/admin/users/${id}`, data);
    return res.data;
}

export async function deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
}
