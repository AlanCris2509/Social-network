import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    flexRender,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { getAdmins } from './api';
import type { AdminUserDto } from './types';
import { TablePagination } from '../../shared/components/TablePagination';

const col = createColumnHelper<AdminUserDto>();

const columns = [
    col.accessor('username', { header: 'Username' }),
    col.accessor('email', { header: 'Email' }),
];

export default function AdminsTable() {
    const { data: admins = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['admins'],
        queryFn: getAdmins,
        refetchInterval: 60_000,
    });

    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data: admins,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Administrators</h2>
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
                                            No administrators found.
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
