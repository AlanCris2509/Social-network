import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    flexRender,
    type SortingState,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from './api';
import { getUsers } from '../user/api';
import type { DepartmentDto, CreateDepartmentRequest } from './types';
import { formatDate } from '../../shared/utils/formatDate';
import { TablePagination } from '../../shared/components/TablePagination';

const col = createColumnHelper<DepartmentDto>();

type ModalState =
    | { open: false }
    | { open: true; mode: 'create' }
    | { open: true; mode: 'edit'; dept: DepartmentDto };

type FormValues = { name: string; location: string; headOfDepartmentId: string };

const errMsg = (err: unknown) =>
    axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Request failed') : 'Request failed';

export default function AdminDepartmentsTable() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState<ModalState>({ open: false });
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const { data: departments = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
        refetchInterval: 60_000,
    });

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        refetchInterval: 60_000,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
    };

    const createMutation = useMutation({ mutationFn: (data: CreateDepartmentRequest) => createDepartment(data) });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateDepartmentRequest }) => updateDepartment(id, data),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteDepartment(id),
        onSuccess: () => { invalidate(); toast.success('Department deleted'); },
        onError: (err) => toast.error(errMsg(err)),
    });

    const closeModal = () => setModal({ open: false });

    const openCreate = () => {
        reset({ name: '', location: '', headOfDepartmentId: '' });
        setModal({ open: true, mode: 'create' });
    };

    const openEdit = (dept: DepartmentDto) => {
        reset({
            name: dept.name,
            location: dept.location,
            headOfDepartmentId: String(dept.headId ?? ''),
        });
        setModal({ open: true, mode: 'edit', dept });
    };

    const onSubmit = handleSubmit(async (data) => {
        const payload: CreateDepartmentRequest = {
            name: data.name.trim(),
            location: data.location.trim(),
            headOfDepartmentId: Number(data.headOfDepartmentId),
        };
        try {
            if (modal.open && modal.mode === 'create') {
                await createMutation.mutateAsync(payload);
                toast.success('Department created successfully');
            } else if (modal.open && modal.mode === 'edit') {
                await updateMutation.mutateAsync({ id: modal.dept.id, data: payload });
                toast.success('Department updated successfully');
            }
            invalidate();
            closeModal();
        } catch (err) {
            setError('root', { message: errMsg(err) });
            toast.error(errMsg(err));
        }
    });

    const columns = [
        col.accessor('name', { header: 'Department' }),
        col.accessor('location', { header: 'Location' }),
        col.accessor('headUsername', {
            header: 'Head of Department',
            cell: (info) => info.getValue() ?? '—',
        }),
        col.accessor('createdAt', {
            header: ({ column }) => (
                <button
                    onClick={column.getToggleSortingHandler()}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >
                    Created
                    <span>{column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}</span>
                </button>
            ),
            cell: (info) => formatDate(info.getValue()),
        }),
        col.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openEdit(row.original)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm(`Delete "${row.original.name}"? Users in this department will become unassigned.`)) {
                                deleteMutation.mutate(row.original.id);
                            }
                        }}
                        className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data: departments,
        columns,
        state: { globalFilter, sorting },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        globalFilterFn: 'includesString',
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    const inp = (hasError: boolean) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-gray-100 ${
            hasError ? 'border-red-400 focus:ring-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
        }`;

    return (
        <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Departments</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Search…"
                                className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                            />
                        </div>
                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="text-sm border border-gray-200 dark:border-gray-600 dark:text-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            {isFetching ? '…' : '↻'}
                        </button>
                        <button
                            onClick={openCreate}
                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            + Add Department
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">Loading…</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    {table.getHeaderGroups().map((hg) => (
                                        <tr key={hg.id} className="border-b border-gray-100 dark:border-gray-700">
                                            {hg.headers.map((h) => (
                                                <th
                                                    key={h.id}
                                                    className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-3 pr-4"
                                                >
                                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="text-center text-gray-400 dark:text-gray-500 py-6">
                                                No departments yet. Add one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr key={row.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="py-3 pr-4 text-gray-700 dark:text-gray-200">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <TablePagination table={table} />
                    </>
                )}
            </div>

            {modal.open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">
                            {modal.mode === 'create' ? 'Add Department' : 'Edit Department'}
                        </h3>

                        {errors.root && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
                                {errors.root.message}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name</label>
                                <input
                                    {...register('name', {
                                        required: 'Name is required',
                                        minLength: { value: 2, message: 'At least 2 characters' },
                                    })}
                                    placeholder="e.g. Engineering"
                                    className={inp(!!errors.name)}
                                />
                                {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                <input
                                    {...register('location', {
                                        required: 'Location is required',
                                        minLength: { value: 2, message: 'At least 2 characters' },
                                    })}
                                    placeholder="e.g. New York"
                                    className={inp(!!errors.location)}
                                />
                                {errors.location && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.location.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Head of Department</label>
                                <select
                                    {...register('headOfDepartmentId', { required: 'Head of department is required' })}
                                    className={inp(!!errors.headOfDepartmentId)}
                                >
                                    <option value="">Select a user…</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.username} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.headOfDepartmentId && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.headOfDepartmentId.message}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {isSubmitting ? 'Saving…' : modal.mode === 'create' ? 'Create' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
