import React, { useState, useMemo } from 'react';
import { useAuditLogs } from '../../hooks/useInventory';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton, EmptyState } from '../../components/ui/Skeleton';
import { formatDateTime } from '../../lib/utils';
import { ShieldAlert, Search, Eye, FileCode2, History } from 'lucide-react';

export function AuditLog() {
  const { data: logs = [], isLoading } = useAuditLogs();

  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (tableFilter !== 'ALL' && log.table_name !== tableFilter) return false;
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTable = log.table_name?.toLowerCase().includes(q);
        const matchRowId = log.row_id?.toLowerCase().includes(q);
        const matchAction = log.action?.toLowerCase().includes(q);
        if (!matchTable && !matchRowId && !matchAction) return false;
      }
      return true;
    });
  }, [logs, tableFilter, actionFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-600" />
          Audit Log & Change Trail
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete tamper-evident record of all create, update, and delete mutations across database entities
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by row ID or table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Tables</option>
            <option value="products">products</option>
            <option value="suppliers">suppliers</option>
            <option value="categories">categories</option>
            <option value="settings">settings</option>
            <option value="profiles">profiles</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Operations</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No audit entries found"
            description="No database changes match the selected criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Entity Table</th>
                  <th className="px-4 py-3.5">Target Row ID</th>
                  <th className="px-4 py-3.5 text-right">Details & Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          log.action === 'INSERT'
                            ? 'success'
                            : log.action === 'UPDATE'
                            ? 'warning'
                            : 'danger'
                        }
                        className="font-mono text-[10px]"
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {log.table_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {log.row_id ? log.row_id.slice(0, 18) + '...' : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setSelectedLog(log)}
                        className="flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Diff
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* JSON Diff Viewer Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Audit Change Record: ${selectedLog.action} on ${selectedLog.table_name}`}
          description={`Logged at ${formatDateTime(selectedLog.created_at)}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Old Data */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Previous State (old_data)
                </p>
                <div className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
                  {selectedLog.old_data ? (
                    <pre>{JSON.stringify(selectedLog.old_data, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-600 italic">null (initial insertion)</span>
                  )}
                </div>
              </div>

              {/* New Data */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  New State (new_data)
                </p>
                <div className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
                  {selectedLog.new_data ? (
                    <pre>{JSON.stringify(selectedLog.new_data, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-600 italic">null (deleted row)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
