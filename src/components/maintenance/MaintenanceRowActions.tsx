import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, UserPlus, Play, CheckSquare } from "lucide-react";
import { useAssetMaintenanceStore } from "@/stores/assetMaintenanceStore";
import { useAuthStore } from "@/stores";
import type { MaintenanceRecord } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MaintenanceRowActionsProps {
  record: MaintenanceRecord;
}

export const MaintenanceRowActions: React.FC<MaintenanceRowActionsProps> = ({ record }) => {
  const { approveRequest, rejectRequest, assignTechnician, startWork, resolveRequest } = useAssetMaintenanceStore();
  const user = useAuthStore((s) => s.user);
  
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  
  const [technician, setTechnician] = useState("");
  const [cost, setCost] = useState("0");
  const [notes, setNotes] = useState("");

  const isManager = user?.role === "manager";
  // Assuming department_head or admin also act as managers for simplicity
  const canApprove = isManager || user?.role === "department_head" || user?.role === "admin";
  
  // Technician role or manager can do work
  const canWork = canApprove || user?.role === "employee"; 

  const handleAssign = () => {
    if (technician) {
      assignTechnician(record.id, technician);
      setIsAssignOpen(false);
    }
  };

  const handleResolve = () => {
    resolveRequest(record.id, parseFloat(cost) || 0, notes);
    setIsResolveOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {record.status === "pending" && canApprove && (
            <>
              <DropdownMenuItem onClick={() => approveRequest(record.id)}>
                <CheckCircle className="mr-2 h-4 w-4 text-success" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => rejectRequest(record.id)}>
                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                Reject
              </DropdownMenuItem>
            </>
          )}

          {record.status === "approved" && canApprove && (
            <DropdownMenuItem onClick={() => setIsAssignOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Tech
            </DropdownMenuItem>
          )}

          {record.status === "assigned" && canWork && (
            <DropdownMenuItem onClick={() => startWork(record.id)}>
              <Play className="mr-2 h-4 w-4 text-primary" />
              Start Work
            </DropdownMenuItem>
          )}

          {record.status === "in_progress" && canWork && (
            <DropdownMenuItem onClick={() => setIsResolveOpen(true)}>
              <CheckSquare className="mr-2 h-4 w-4 text-success" />
              Resolve
            </DropdownMenuItem>
          )}
          
          {record.status === "resolved" && (
            <DropdownMenuItem disabled>
              Completed
            </DropdownMenuItem>
          )}
          {record.status === "rejected" && (
            <DropdownMenuItem disabled>
              Rejected
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assign Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Technician Name</Label>
              <Input 
                placeholder="e.g., John Doe" 
                value={technician} 
                onChange={(e) => setTechnician(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!technician}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resolve Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cost ($)</Label>
              <Input 
                type="number"
                placeholder="0.00" 
                value={cost} 
                onChange={(e) => setCost(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Input 
                placeholder="Work performed..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveOpen(false)}>Cancel</Button>
            <Button onClick={handleResolve}>Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
