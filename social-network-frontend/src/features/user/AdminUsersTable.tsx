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
    type ColumnFiltersState,
    type SortingState,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getUsers, createUser, updateUser, deleteUser } from './api';
import { getDepartments } from '../department/api';
import type { UserDto, CreateUserRequest, UpdateUserRequest } from './types';
import { formatDate } from '../../shared/utils/formatDate';
import { TablePagination } from '../../shared/components/TablePagination';

const col = createColumnHelper<UserDto>();

type ModalState =
    | { open: false }
    | { open: true; mode: 'create' }
    | { open: true; mode: 'edit'; user: UserDto };

type CreateForm = {
    username: string;
    password: string;
    email: string;
    role: 'USER' | 'ADMIN';
    departmentId: string;
};

type EditForm = {
    username: string;
    password: string;
    email: string;
    departmentId: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const errMsg = (err: unknown) =>
    axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Request failed') : 'Request failed';

export default function AdminUsersTable() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState<ModalState>({ open: false });
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    // ── Create form ──────────────────────────────────────────────────────────
    const {
        register: regCreate,
        handleSubmit: submitCreate,
        reset: resetCreate,
        watch: watchCreate,
        setError: setCreateError,
        formState: { errors: createErrors, isSubmitting: isCreating },
    } = useForm<CreateForm>({ defaultValues: { username: '', password: '', email: '', role: 'USER', departmentId: '' } });

    // ── Edit form ────────────────────────────────────────────────────────────
    const {
        register: regEdit,
        handleSubmit: submitEdit,
        reset: resetEdit,
        setError: setEditError,
        formState: { errors: editErrors, isSubmitting: isEditing },
    } = useForm<EditForm>({ defaultValues: { username: '', password: '', email: '', departmentId: '' } });

    const watchedRole = watchCreate('role');

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: users = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        refetchInterval: 60_000,
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
        refetchInterval: 60_000,
    });

    // ── Mutations ────────────────────────────────────────────────────────────
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['admins'] });
    };

    const createMutation = useMutation({ mutationFn: (d: CreateUserRequest) => createUser(d) });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) => updateUser(id, data),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteUser(id),
        onSuccess: () => { invalidate(); toast.success('User deleted'); },
        onError: (err) => toast.error(errMsg(err)),
    });

    // ── Handlers ─────────────────────────────────────────────────────────────
    const closeModal = () => setModal({ open: false });

    const openCreate = () => {
        resetCreate({ username: '', password: '', email: '', role: 'USER', departmentId: '' });
        setModal({ open: true, mode: 'create' });
    };

    const openEdit = (user: UserDto) => {
        resetEdit({
            username: user.username,
            password: '',
            email: user.email,
            departmentId: String(user.departmentId ?? ''),
        });
        setModal({ open: true, mode: 'edit', user });
    };

    const onCreateSubmit = submitCreate(async (data) => {
        try {
            await createMutation.mutateAsync({
                username: data.username.trim(),
                password: data.password,
                email: data.email.trim(),
                role: data.role,
                departmentId: data.role === 'USER' && data.departmentId ? Number(data.departmentId) : null,
            });
            invalidate();
            toast.success('User created successfully');
            closeModal();
        } catch (err) {
            setCreateError('root', { message: errMsg(err) });
            toast.error(errMsg(err));
        }
    });

    const onEditSubmit = submitEdit(async (data) => {
        if (!modal.open || modal.mode !== 'edit') return;
        try {
            await updateMutation.mutateAsync({
                id: modal.user.id,
                data: {
                    username: data.username.trim(),
                    password: data.password || undefined,
                    email: data.email.trim(),
                    departmentId: data.departmentId ? Number(data.departmentId) : null,
                },
            });
            invalidate();
            toast.success('User updated successfully');
            closeModal();
        } catch (err) {
            setEditError('root', { message: errMsg(err) });
            toast.error(errMsg(err));
        }
    });

    // ── Table ─────────────────────────────────────────────────────────────────
    const columns = [
        col.accessor('username', { header: 'Username' }),
        col.accessor('email', { header: 'Email' }),
        col.accessor('departmentName', {
            header: 'Department',
            filterFn: 'equals',
            cell: (info) => info.getValue() ?? '—',
        }),
        col.accessor('headUsername', {
            header: 'Head of Dept.',
            filterFn: 'equals',
            cell: (info) => info.getValue() ?? '—',
        }),
        col.accessor('joinedDepartmentAt', {
            header: ({ column }) => (
                <button
                    onClick={column.getToggleSortingHandler()}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >
                    Joined Time
                    <span>{column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}</span>
                </button>
            ),
            enableColumnFilter: false,
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
                            if (window.confirm(`Delete user "${row.original.username}"? This cannot be undone.`)) {
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
        data: users,
        columns,
        state: { globalFilter, columnFilters, sorting },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        globalFilterFn: 'includesString',
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    const deptNames = [...new Set(users.map((u) => u.departmentName).filter(Boolean))] as string[];
    const headNames = [...new Set(users.map((u) => u.headUsername).filter(Boolean))] as string[];
    const deptFilter = (columnFilters.find((f) => f.id === 'departmentName')?.value as string) ?? '';
    const headFilter = (columnFilters.find((f) => f.id === 'headUsername')?.value as string) ?? '';

    return (
        <>
            {/* ── Table card ─────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">All Employees</h2>
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
                        <select
                            value={deptFilter}
                            onChange={(e) =>
                                table.getColumn('departmentName')?.setFilterValue(e.target.value || undefined)
                            }
                            className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Departments</option>
                            {deptNames.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            value={headFilter}
                            onChange={(e) =>
                                table.getColumn('headUsername')?.setFilterValue(e.target.value || undefined)
                            }
                            className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Heads</option>
                            {headNames.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
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
                            + Add User
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
                                                No employees match the current filters.
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

            {/* ── Create modal ───────────────────────────────────────────── */}
            {modal.open && modal.mode === 'create' && (
                <Modal title="Add User">
                    {createErrors.root && <ServerError message={createErrors.root.message} />}
                    <form onSubmit={onCreateSubmit} className="space-y-4">
                        <Field label="Username" error={createErrors.username?.message}>
                            <input
                                {...regCreate('username', {
                                    required: 'Username is required',
                                    minLength: { value: 3, message: 'At least 3 characters' },
                                })}
                                placeholder="username"
                                className={inp(!!createErrors.username)}
                            />
                        </Field>
                        <Field label="Password" error={createErrors.password?.message}>
                            <input
                                type="password"
                                {...regCreate('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'At least 6 characters' },
                                })}
                                placeholder="password"
                                className={inp(!!createErrors.password)}
                            />
                        </Field>
                        <Field label="Email" error={createErrors.email?.message}>
                            <input
                                type="email"
                                {...regCreate('email', {
                                    required: 'Email is required',
                                    pattern: { value: EMAIL_PATTERN, message: 'Invalid email address' },
                                })}
                                placeholder="user@example.com"
                                className={inp(!!createErrors.email)}
                            />
                        </Field>
                        <Field label="Role">
                            <select {...regCreate('role')} className={inp(false)}>
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </Field>
                        {watchedRole === 'USER' && (
                            <Field label="Department" error={createErrors.departmentId?.message}>
                                <select
                                    {...regCreate('departmentId', { required: 'Department is required' })}
                                    className={inp(!!createErrors.departmentId)}
                                >
                                    <option value="">Select a department…</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </Field>
                        )}
                        <Actions onCancel={closeModal} isSubmitting={isCreating} submitLabel="Create" />
                    </form>
                </Modal>
            )}

            {/* ── Edit modal ─────────────────────────────────────────────── */}
            {modal.open && modal.mode === 'edit' && (
                <Modal title={`Edit — ${modal.user.username}`}>
                    {editErrors.root && <ServerError message={editErrors.root.message} />}
                    <form onSubmit={onEditSubmit} className="space-y-4">
                        <Field label="Username" error={editErrors.username?.message}>
                            <input
                                {...regEdit('username', {
                                    required: 'Username is required',
                                    minLength: { value: 3, message: 'At least 3 characters' },
                                })}
                                className={inp(!!editErrors.username)}
                            />
                        </Field>
                        <Field label="Password" error={editErrors.password?.message}>
                            <input
                                type="password"
                                {...regEdit('password', {
                                    minLength: { value: 6, message: 'At least 6 characters' },
                                })}
                                placeholder="Leave blank to keep current"
                                className={inp(!!editErrors.password)}
                            />
                        </Field>
                        <Field label="Email" error={editErrors.email?.message}>
                            <input
                                type="email"
                                {...regEdit('email', {
                                    required: 'Email is required',
                                    pattern: { value: EMAIL_PATTERN, message: 'Invalid email address' },
                                })}
                                className={inp(!!editErrors.email)}
                            />
                        </Field>
                        <Field label="Department" error={editErrors.departmentId?.message}>
                            <select
                                {...regEdit('departmentId', { required: 'Department is required' })}
                                className={inp(!!editErrors.departmentId)}
                            >
                                <option value="">Select a department…</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Actions onCancel={closeModal} isSubmitting={isEditing} submitLabel="Save Changes" />
                    </form>
                </Modal>
            )}
        </>
    );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const inp = (err: boolean) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-gray-100 ${
        err ? 'border-red-400 focus:ring-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
    }`;

function Modal({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">{title}</h3>
                {children}
            </div>
        </div>
    );
}

function ServerError({ message }: { message?: string }) {
    return (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
            {message}
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

function Actions({
    onCancel,
    isSubmitting,
    submitLabel,
}: {
    onCancel: () => void;
    isSubmitting: boolean;
    submitLabel: string;
}) {
    return (
        <div className="flex justify-end gap-3 pt-2">
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {isSubmitting ? 'Saving…' : submitLabel}
            </button>
        </div>
    );
}
