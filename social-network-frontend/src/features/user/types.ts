export interface UserDto {
    id: number;
    username: string;
    email: string;
    departmentId: number | null;
    departmentName: string | null;
    headUsername: string | null;
    joinedDepartmentAt: string | null;
}

export interface AdminUserDto {
    id: number;
    username: string;
    email: string;
}

export interface CreateUserRequest {
    username: string;
    password: string;
    email: string;
    role: 'USER' | 'ADMIN';
    departmentId?: number | null;
}

export interface UpdateUserRequest {
    username: string;
    password?: string;
    email: string;
    departmentId?: number | null;
}
