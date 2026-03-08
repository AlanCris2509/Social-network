import type { DepartmentDto, CreateDepartmentRequest } from './types';
import { apiClient } from '../../shared/api/apiClient';

export async function getDepartments(): Promise<DepartmentDto[]> {
    const res = await apiClient.get<DepartmentDto[]>('/departments');
    return res.data;
}

export async function createDepartment(data: CreateDepartmentRequest): Promise<DepartmentDto> {
    const res = await apiClient.post<DepartmentDto>('/departments', data);
    return res.data;
}

export async function updateDepartment(id: number, data: CreateDepartmentRequest): Promise<DepartmentDto> {
    const res = await apiClient.put<DepartmentDto>(`/departments/${id}`, data);
    return res.data;
}

export async function deleteDepartment(id: number): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
}
