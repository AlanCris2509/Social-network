import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { getUsers } from './api';
import type { UserDto } from './types';
import { formatDate } from '../../shared/utils/formatDate';
import { TablePagination } from '../../shared/components/TablePagination';

const col = createColumnHelper<UserDto>();

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
];

export default function UsersTable() {
    const { data: users = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        refetchInterval: 60_000,
    });

    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

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
    );
}
