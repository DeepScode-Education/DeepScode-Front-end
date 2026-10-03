import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";

interface SupportTicket {
  id: string;
  user_id: string;
  issue_type: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    user_id: string;
    display_name: string | null;
  } | null;
}

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Use any to bypass missing table types
      const { data: ticketsData, error: ticketsError } = await (supabase
        .from("support_tickets" as any)
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
        toast.error("Failed to load support tickets");
        return;
      }

      if (!ticketsData || ticketsData.length === 0) {
        setTickets([]);
        setLoading(false);
        return;
      }

      const userIds = [
        ...new Set(ticketsData.map((ticket: any) => ticket.user_id)),
      ];

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds as string[]);

      const ticketsWithProfiles = ticketsData.map((ticket: any) => ({
        ...ticket,
        profiles:
          profilesData?.find((profile) => profile.user_id === ticket.user_id) ||
          null,
      }));

      setTickets(ticketsWithProfiles);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (
    ticketId: string,
    updates: Partial<SupportTicket>,
  ) => {
    setUpdating(true);
    try {
      const { error } = await (supabase
        .from("support_tickets" as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", ticketId) as any);

      if (error) {
        console.error("Error updating ticket:", error);
        toast.error("Failed to update ticket");
        return;
      }

      toast.success("Ticket updated successfully");
      fetchTickets();
      setSelectedTicket(null);
      setAdminNotes("");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-secondary" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-[#0037FF]" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-accent text-[#0037FF]";
      case "in_progress":
        return "bg-accent text-[#0037FF]";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "closed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "high":
        return "bg-accent text-secondary";
      case "urgent":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Support Tickets
          </h1>
          <Button onClick={fetchTickets} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {ticket.subject}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        From: {ticket.profiles?.display_name || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1 capitalize">
                        {ticket.status.replace("_", " ")}
                      </span>
                    </Badge>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {ticket.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {ticket.issue_type}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setAdminNotes(ticket.admin_notes || "");
                    }}
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No support tickets yet</h3>
            <p className="text-muted-foreground">
              Support tickets from users will appear here.
            </p>
          </div>
        )}

        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Manage Support Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Ticket Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Subject:</strong> {selectedTicket.subject}
                    </p>
                    <p>
                      <strong>Issue Type:</strong> {selectedTicket.issue_type}
                    </p>
                    <p>
                      <strong>User:</strong>{" "}
                      {selectedTicket.profiles?.display_name || "Unknown"}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedTicket.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Status
                    </label>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) =>
                        setSelectedTicket({ ...selectedTicket, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Priority
                    </label>
                    <Select
                      value={selectedTicket.priority}
                      onValueChange={(value) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          priority: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Admin Notes
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() =>
                      updateTicket(selectedTicket.id, {
                        status: selectedTicket.status,
                        priority: selectedTicket.priority,
                        admin_notes: adminNotes,
                      })
                    }
                    disabled={updating}
                    className="flex-1"
                  >
                    {updating ? "Updating..." : "Update Ticket"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTicket(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportTickets;
