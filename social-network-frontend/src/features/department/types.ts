export interface DepartmentDto {
    id: number;
    name: string;
    location: string;
    headId: number | null;
    headUsername: string | null;
    createdAt: string | null;
}

export interface CreateDepartmentRequest {
    name: string;
    location: string;
    headOfDepartmentId: number;
}
