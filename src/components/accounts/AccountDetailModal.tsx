import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatedTasksSection } from "@/components/shared/RelatedTasksSection";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Task, CreateTaskData } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { 
  Building2, 
  Globe, 
  Phone, 
  MapPin, 
  Factory,
  Clock,
  Plus,
  ExternalLink,
  Mail,
  Pencil,
  ListTodo,
  History
} from "lucide-react";
import { RecordChangeHistory } from "@/components/shared/RecordChangeHistory";
import { format } from "date-fns";
import { AccountActivityTimeline } from "./AccountActivityTimeline";
import { AccountAssociations } from "./AccountAssociations";
import { ActivityLogModal } from "./ActivityLogModal";
import { getAccountStatusColor } from "@/utils/accountStatusUtils";

interface Account {
  id: string;
  company_name: string;
  email?: string | null;
  website?: string | null;
  phone?: string | null;
  industry?: string | null;
  region?: string | null;
  country?: string | null;
  status?: string | null;
  notes?: string | null;
  company_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AccountDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onUpdate?: () => void;
  onEdit?: (account: Account) => void;
  defaultTab?: string;
}

export const AccountDetailModal = ({ open, onOpenChange, account, onUpdate, onEdit, defaultTab = "overview" }: AccountDetailModalProps) => {
  const { createTask, updateTask } = useTasks();
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Task modal state - lifted to this level so TaskModal is a sibling, not child
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasksRefreshToken, setTasksRefreshToken] = useState(0);
  
  // Update activeTab when defaultTab prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, open]);

  // Handle request to create task - close account modal first, then open task modal
  const handleRequestCreateTask = () => {
    setEditingTask(null);
    onOpenChange(false); // Close account modal first
    // Use setTimeout to ensure the dialog fully unmounts and cleans up pointer-events
    setTimeout(() => {
      setTaskModalOpen(true);
    }, 250);
  };

  // Handle request to edit task
  const handleRequestEditTask = (task: Task) => {
    setEditingTask(task);
    onOpenChange(false);
    setTimeout(() => {
      setTaskModalOpen(true);
    }, 250);
  };

  // Handle task modal close - reopen account modal
  const handleTaskModalClose = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
    setTasksRefreshToken(prev => prev + 1); // Trigger tasks list refresh
    setTimeout(() => {
      onOpenChange(true);
      setActiveTab('tasks'); // Return to tasks tab
    }, 100);
  };

  // Handle task submit
  const handleTaskSubmit = async (data: CreateTaskData) => {
    if (!account) return null;
    const taskData: CreateTaskData = {
      ...data,
      module_type: 'accounts',
      account_id: account.id,
    };
    const result = await createTask(taskData);
    if (result) {
      handleTaskModalClose();
    }
    return result;
  };

  // Handle task update
  const handleTaskUpdate = async (taskId: string, data: Partial<Task>, original: Task) => {
    const result = await updateTask(taskId, data, original);
    if (result) {
      handleTaskModalClose();
    }
    return result;
  };

  if (!account) return null;

  const handleActivityLogged = () => {
    setRefreshKey(prev => prev + 1);
    onUpdate?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {account.company_name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getAccountStatusColor(account.status)}>
                    {account.status || 'New'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(account)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Update
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActivityLog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Log Activity
                </Button>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <ListTodo className="h-3 w-3" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="timeline">Activity</TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1">
                <History className="h-3 w-3" />
                History
              </TabsTrigger>
              <TabsTrigger value="associations">Related</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Account Info - 2 Column Grid */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Company Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {account.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{account.email}</span>
                      </div>
                    )}
                    {account.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a href={`tel:${account.phone}`} className="hover:underline truncate">
                          {account.phone}
                        </a>
                      </div>
                    )}
                    {account.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a 
                          href={account.website.startsWith('http') ? account.website : `https://${account.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{account.website}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                    {account.industry && (
                      <div className="flex items-center gap-2 text-sm">
                        <Factory className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{account.industry}</span>
                      </div>
                    )}
                    {account.company_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{account.company_type}</span>
                      </div>
                    )}
                    {(account.region || account.country) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{[account.region, account.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {account.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{account.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Timestamps */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {account.created_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created: {format(new Date(account.created_at), 'dd/MM/yyyy')}
                  </span>
                )}
                {account.updated_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated: {format(new Date(account.updated_at), 'dd/MM/yyyy')}
                  </span>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4" forceMount hidden={activeTab !== 'tasks'}>
              <RelatedTasksSection 
                moduleType="accounts"
                recordId={account.id}
                recordName={account.company_name}
                refreshToken={tasksRefreshToken}
                onRequestCreateTask={handleRequestCreateTask}
                onRequestEditTask={handleRequestEditTask}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-4" forceMount hidden={activeTab !== 'timeline'}>
              <AccountActivityTimeline key={refreshKey} accountId={account.id} />
            </TabsContent>

            <TabsContent value="history" className="mt-4" forceMount hidden={activeTab !== 'history'}>
              <RecordChangeHistory entityType="accounts" entityId={account.id} maxHeight="400px" />
            </TabsContent>

            <TabsContent value="associations" className="mt-4" forceMount hidden={activeTab !== 'associations'}>
              <AccountAssociations 
                accountId={account.id} 
                companyName={account.company_name} 
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Activity Log Modal */}
      <ActivityLogModal
        open={showActivityLog}
        onOpenChange={setShowActivityLog}
        accountId={account.id}
        onSuccess={handleActivityLogged}
      />

      {/* Task Modal - rendered as sibling so it doesn't unmount when account modal closes */}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleTaskModalClose();
          }
        }}
        task={editingTask}
        onSubmit={handleTaskSubmit}
        onUpdate={handleTaskUpdate}
        context={{ 
          module: 'accounts', 
          recordId: account.id, 
          recordName: account.company_name, 
          locked: true 
        }}
      />
    </>
  );
};
