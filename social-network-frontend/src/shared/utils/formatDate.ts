export const formatDate = (iso: string | null | undefined): string =>
    iso ? new Date(iso).toLocaleString() : '—';
