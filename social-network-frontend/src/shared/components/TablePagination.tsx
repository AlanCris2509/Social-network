import type { Table } from '@tanstack/react-table';

export function TablePagination<T>({ table }: { table: Table<T> }) {
    const { pageIndex, pageSize } = table.getState().pagination;
    const total = table.getFilteredRowModel().rows.length;
    const from = total === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min((pageIndex + 1) * pageSize, total);
    const pageCount = table.getPageCount();

    return (
        <div className="flex items-center justify-between mt-4 gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                {total === 0 ? 'No rows' : `Showing ${from}–${to} of ${total}`}
            </span>

            <div className="flex items-center gap-2">
                <select
                    value={pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    {[10, 20, 50].map((s) => (
                        <option key={s} value={s}>{s} / page</option>
                    ))}
                </select>

                <span className="text-xs text-gray-400 dark:text-gray-500">
                    Page {pageIndex + 1} of {pageCount || 1}
                </span>

                <div className="flex gap-1">
                    {([
                        { label: '«', fn: () => table.firstPage(),    can: table.getCanPreviousPage() },
                        { label: '‹', fn: () => table.previousPage(), can: table.getCanPreviousPage() },
                        { label: '›', fn: () => table.nextPage(),     can: table.getCanNextPage()     },
                        { label: '»', fn: () => table.lastPage(),     can: table.getCanNextPage()     },
                    ] as const).map(({ label, fn, can }) => (
                        <button
                            key={label}
                            onClick={fn}
                            disabled={!can}
                            className="w-7 h-7 flex items-center justify-center rounded text-sm border border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
