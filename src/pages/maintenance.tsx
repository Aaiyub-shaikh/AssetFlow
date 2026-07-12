import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Wrench, User, Calendar, AlertTriangle,
  CheckCircle, Clock, XCircle, Play, UserPlus, CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/layout/page-shell";
import { useAssetMaintenanceStore } from "@/stores/assetMaintenanceStore";
import { useAuthStore } from "@/stores";
import { RaiseRequestDialog } from "@/components/maintenance/RaiseRequestDialog";
import type { MaintenanceRecord } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:     { label: "Pending",     color: "text-amber-400",   bg: "bg-amber-400/15 border border-amber-400/30",   icon: <Clock className="h-3 w-3" /> },
  approved:    { label: "Approved",    color: "text-blue-400",    bg: "bg-blue-400/15 border border-blue-400/30",     icon: <CheckCircle className="h-3 w-3" /> },
  rejected:    { label: "Rejected",    color: "text-red-400",     bg: "bg-red-400/15 border border-red-400/30",       icon: <XCircle className="h-3 w-3" /> },
  assigned:    { label: "Assigned",    color: "text-purple-400",  bg: "bg-purple-400/15 border border-purple-400/30", icon: <User className="h-3 w-3" /> },
  in_progress: { label: "Active",      color: "text-cyan-400",    bg: "bg-cyan-400/15 border border-cyan-400/30",     icon: <Play className="h-3 w-3" /> },
  resolved:    { label: "Resolved",    color: "text-emerald-400", bg: "bg-emerald-400/15 border border-emerald-400/30", icon: <CheckCircle className="h-3 w-3" /> },
  completed:   { label: "Completed",   color: "text-emerald-400", bg: "bg-emerald-400/15 border border-emerald-400/30", icon: <CheckCircle className="h-3 w-3" /> },
  scheduled:   { label: "Scheduled",   color: "text-indigo-400",  bg: "bg-indigo-400/15 border border-indigo-400/30",  icon: <Calendar className="h-3 w-3" /> },
  overdue:     { label: "Overdue",     color: "text-red-400",     bg: "bg-red-400/15 border border-red-400/30",       icon: <AlertTriangle className="h-3 w-3" /> },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  preventive: { label: "Preventive", color: "text-blue-400/80" },
  corrective: { label: "Corrective", color: "text-orange-400/80" },
  emergency:  { label: "Emergency",  color: "text-red-400/80" },
};

const PRIORITY_BORDER: Record<string, string> = {
  critical: "border-l-red-500",
  high:     "border-l-orange-500",
  medium:   "border-l-amber-500",
  low:      "border-l-slate-500",
};

// ── Tab filters ──────────────────────────────────────────────────────────────
type Tab = "all" | "pending" | "active" | "history";
const TAB_FILTERS: Record<Tab, (r: MaintenanceRecord) => boolean> = {
  all:     () => true,
  pending: (r) => ["pending", "approved", "rejected"].includes(r.status),
  active:  (r) => ["assigned", "in_progress"].includes(r.status),
  history: (r) => ["resolved", "completed", "overdue", "scheduled"].includes(r.status),
};

// ── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "text-muted-foreground", bg: "bg-muted/30", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── MaintenanceCard ──────────────────────────────────────────────────────────
interface CardProps {
  record: MaintenanceRecord;
  index: number;
  canApprove: boolean;
  canWork: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onStartWork: (id: string) => void;
  onAssign: (record: MaintenanceRecord) => void;
  onResolve: (record: MaintenanceRecord) => void;
}

function MaintenanceCard({ record, index, canApprove, canWork, onApprove, onReject, onStartWork, onAssign, onResolve }: CardProps) {
  const typeCfg = TYPE_CONFIG[record.type] ?? { label: record.type, color: "text-muted-foreground" };
  const borderColor = PRIORITY_BORDER[record.priority] ?? "border-l-slate-500";

  const formattedDate = (() => {
    try { return new Date(record.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return record.scheduledDate; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`relative rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-4 flex flex-col gap-3 border-l-4 ${borderColor} hover:bg-white/[0.07] transition-colors group`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight truncate">{record.assetName}</p>
          <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">{record.assetTag}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge status={record.status} />
          <span className="text-[10px] text-muted-foreground/50">{formattedDate}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{record.description}</p>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.05]">
        <span className={`flex items-center gap-1 text-xs font-medium ${typeCfg.color}`}>
          <Wrench className="h-3 w-3" />
          {typeCfg.label}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
          <User className="h-3 w-3" />
          {record.assignedTo}
        </span>
      </div>

      {/* Action buttons — appear on hover */}
      {(() => {
        const actions: React.ReactNode[] = [];
        if (record.status === "pending" && canApprove) {
          actions.push(
            <button key="approve" onClick={() => onApprove(record.id)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 transition-colors flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" /> Approve
            </button>,
            <button key="reject" onClick={() => onReject(record.id)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 transition-colors flex items-center justify-center gap-1">
              <XCircle className="h-3 w-3" /> Reject
            </button>
          );
        }
        if (record.status === "approved" && canApprove) {
          actions.push(
            <button key="assign" onClick={() => onAssign(record)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/20 transition-colors flex items-center justify-center gap-1">
              <UserPlus className="h-3 w-3" /> Assign Tech
            </button>
          );
        }
        if (record.status === "assigned" && canWork) {
          actions.push(
            <button key="start" onClick={() => onStartWork(record.id)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/20 transition-colors flex items-center justify-center gap-1">
              <Play className="h-3 w-3" /> Start Work
            </button>
          );
        }
        if (record.status === "in_progress" && canWork) {
          actions.push(
            <button key="resolve" onClick={() => onResolve(record)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 transition-colors flex items-center justify-center gap-1">
              <CheckSquare className="h-3 w-3" /> Resolve
            </button>
          );
        }
        if (actions.length === 0) return null;
        return (
          <div className="flex gap-2 mt-1">
            {actions}
          </div>
        );
      })()}
    </motion.div>
  );
}

// ── MaintenancePage ──────────────────────────────────────────────────────────
export function MaintenancePage() {
  const { maintenanceRecords, approveRequest, rejectRequest, assignTechnician, startWork, resolveRequest } = useAssetMaintenanceStore();
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);

  // Assign dialog
  const [assignRecord, setAssignRecord] = useState<MaintenanceRecord | null>(null);
  const [techName, setTechName] = useState("");

  // Resolve dialog
  const [resolveRecord, setResolveRecord] = useState<MaintenanceRecord | null>(null);
  const [resolveCost, setResolveCost] = useState("0");
  const [resolveNotes, setResolveNotes] = useState("");

  const canApprove = ["admin", "manager", "department_head"].includes(user?.role ?? "");
  const canWork = canApprove || user?.role === "employee";

  const filtered = maintenanceRecords.filter((r) => {
    const matchesTab = TAB_FILTERS[tab](r);
    const q = search.toLowerCase();
    const matchesSearch = !q || r.assetName.toLowerCase().includes(q) || r.assetTag.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all",     label: "All",     count: maintenanceRecords.length },
    { key: "pending", label: "Pending", count: maintenanceRecords.filter(TAB_FILTERS.pending).length },
    { key: "active",  label: "Active",  count: maintenanceRecords.filter(TAB_FILTERS.active).length },
    { key: "history", label: "History", count: maintenanceRecords.filter(TAB_FILTERS.history).length },
  ];

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Route repairs through approval, assign technicians, and track maintenance workflows
            </p>
          </div>
          <Button onClick={() => setIsRaiseOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Raise Request
          </Button>
        </div>

        {/* Search + Tabs bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search maintenance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/[0.04] border-white/[0.08]"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                }`}
              >
                {t.label}
                {t.count > 0 && tab !== t.key && (
                  <span className="ml-1.5 text-xs opacity-60">{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 mb-4">
                <Wrench className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              </div>
              <p className="text-muted-foreground font-medium">No maintenance records</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                There are no records in this category. Raise a new request to get started.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {filtered.map((record, i) => (
                  <MaintenanceCard
                    key={record.id}
                    record={record}
                    index={i}
                    canApprove={canApprove}
                    canWork={canWork}
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                    onStartWork={startWork}
                    onAssign={(r) => { setAssignRecord(r); setTechName(""); }}
                    onResolve={(r) => { setResolveRecord(r); setResolveCost("0"); setResolveNotes(""); }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Raise Request Dialog */}
      <RaiseRequestDialog open={isRaiseOpen} onOpenChange={setIsRaiseOpen} />

      {/* Assign Technician Dialog */}
      <Dialog open={!!assignRecord} onOpenChange={(o) => !o && setAssignRecord(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">{assignRecord?.assetName} — {assignRecord?.description}</p>
            <div className="space-y-1.5">
              <Label>Technician Name</Label>
              <Input placeholder="e.g., Tom Bradley" value={techName} onChange={(e) => setTechName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRecord(null)}>Cancel</Button>
            <Button disabled={!techName} onClick={() => { assignTechnician(assignRecord!.id, techName); setAssignRecord(null); }}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={!!resolveRecord} onOpenChange={(o) => !o && setResolveRecord(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resolve Maintenance</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">{resolveRecord?.assetName} — {resolveRecord?.description}</p>
            <div className="space-y-1.5">
              <Label>Repair Cost ($)</Label>
              <Input type="number" min="0" placeholder="0.00" value={resolveCost} onChange={(e) => setResolveCost(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Resolution Notes</Label>
              <Input placeholder="What was done..." value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveRecord(null)}>Cancel</Button>
            <Button onClick={() => { resolveRequest(resolveRecord!.id, parseFloat(resolveCost) || 0, resolveNotes); setResolveRecord(null); }}>
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
