"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  LogOut,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Copy,
  Plus,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react";
import { CreditLink } from "@/components/credit-link";

interface AdminClient {
  id: string;
  name: string;
  sheetId: string;
  brandColor: string;
  status: string;
  createdAt: string;
}

interface CreatedClient {
  clientId: string;
  name: string;
  sheetUrl: string;
  dashboardUrl: string;
}

interface AdminDashboardProps {
  serviceAccountEmail: string;
  passwordRequired?: boolean;
}

export function AdminDashboard({ serviceAccountEmail, passwordRequired = false }: AdminDashboardProps) {
  const router = useRouter();
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingSheet, setCheckingSheet] = useState<string | null>(null);

  // Add client form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    sheetId: "",
    brandColor: "#3b82f6",
  });

  // Created client details (shown after successful creation)
  const [createdClient, setCreatedClient] = useState<CreatedClient | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/clients");
      if (!res.ok) {
        if (res.status === 401) {
          router.refresh();
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setClients(data.clients);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.refresh();
  }

  async function handleToggleStatus(client: AdminClient) {
    const newStatus = client.status === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        `${client.name} ${newStatus === "active" ? "activated" : "suspended"}`
      );
      fetchClients();
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(client: AdminClient) {
    if (
      !window.confirm(
        `Are you sure you want to delete ${client.name}? This cannot be undone.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success(`${client.name} deleted`);
      fetchClients();
    } catch {
      toast.error("Failed to delete client");
    }
  }

  async function handleCheckSheet(clientId: string) {
    setCheckingSheet(clientId);
    try {
      const res = await fetch(
        `/api/admin/clients/${clientId}/check-sheet`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.valid) {
        toast.success("Sheet is healthy — all tabs present");
      } else {
        toast.error(
          data.error || `Missing tabs: ${data.missingTabs?.join(", ")}`
        );
      }
    } catch {
      toast.error("Failed to check sheet");
    } finally {
      setCheckingSheet(null);
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.sheetId.trim()) {
      toast.error("Name and Sheet ID are required");
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          sheetId: addForm.sheetId.trim(),
          brandColor: addForm.brandColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create client");
        return;
      }

      const dashboardUrl = `${window.location.origin}/dashboard/${data.clientId}`;

      setCreatedClient({
        clientId: data.clientId,
        name: addForm.name.trim(),
        sheetUrl: data.sheetUrl,
        dashboardUrl,
      });

      setShowAddForm(false);
      setAddForm({ name: "", sheetId: "", brandColor: "#3b82f6" });
      fetchClients();
      toast.success("Client created successfully");
    } catch {
      toast.error("Failed to create client");
    } finally {
      setAddLoading(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-500" />
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <Badge variant="outline" className="text-xs">
              {clients.length} clients
            </Badge>
          </div>
          {passwordRequired && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-xs text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter((c) => c.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter((c) => c.status === "suspended").length}
                </p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Created Client Details */}
        {createdClient && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                Dashboard created. Send these details
              </CardTitle>
              <CardDescription className="text-xs">
                Copy and send these to {createdClient.name}. Anyone with the link can view it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Client ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-background/50 rounded px-2 py-1 flex-1">
                      {createdClient.clientId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => copyToClipboard(createdClient.clientId, "Client ID")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Dashboard URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-background/50 rounded px-2 py-1.5 flex-1 truncate">
                    {createdClient.dashboardUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(createdClient.dashboardUrl, "Dashboard URL")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <a href={createdClient.dashboardUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Google Sheet</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-background/50 rounded px-2 py-1.5 flex-1 truncate">
                    {createdClient.sheetUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(createdClient.sheetUrl, "Sheet URL")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <a href={createdClient.sheetUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const text = `Dashboard: ${createdClient.dashboardUrl}\nClient ID: ${createdClient.clientId}\nGoogle Sheet: ${createdClient.sheetUrl}`;
                    copyToClipboard(text, "All details");
                  }}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCreatedClient(null)}
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Client */}
        {showAddForm && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Client
              </CardTitle>
              <CardDescription className="text-xs">
                Connect a Google Sheet to create a new client dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Business Name</Label>
                    <Input
                      id="add-name"
                      placeholder="e.g. MoreLife Elite"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      required
                    />
                    {addForm.name.trim() && (
                      <p className="text-xs text-muted-foreground">
                        ID:{" "}
                        <code className="font-mono">
                          {addForm.name
                            .trim()
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                            .slice(0, 40)}
                        </code>
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Google Sheet
                  </Label>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      The sheet must be shared with this email (Viewer access is enough):
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-background/50 rounded px-2 py-1 flex-1 overflow-hidden text-ellipsis">
                        {serviceAccountEmail}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(serviceAccountEmail, "Email")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70">
                      Required tabs: Setters, Closers, Ads, Payments
                    </p>
                  </div>
                  <Input
                    placeholder="Paste Google Sheet URL or ID"
                    value={addForm.sheetId}
                    onChange={(e) =>
                      setAddForm({ ...addForm, sheetId: e.target.value })
                    }
                    required
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Brand Colour</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={addForm.brandColor}
                      onChange={(e) =>
                        setAddForm({ ...addForm, brandColor: e.target.value })
                      }
                      className="h-9 w-9 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <Input
                      value={addForm.brandColor}
                      onChange={(e) =>
                        setAddForm({ ...addForm, brandColor: e.target.value })
                      }
                      className="font-mono text-xs w-32"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={addLoading} className="flex-1">
                    {addLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Client"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Client Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Clients</CardTitle>
              <CardDescription className="text-xs">
                Manage all registered dashboards
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!showAddForm && (
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Client
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchClients}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : clients.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No clients yet. Click &quot;Add Client&quot; to create one.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sheet</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: client.brandColor }}
                            />
                            {client.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs font-mono">
                            {client.id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              client.status === "active"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs cursor-pointer"
                            onClick={() => handleToggleStatus(client)}
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <a
                              href={`https://docs.google.com/spreadsheets/d/${client.sheetId}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-foreground transition"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              disabled={checkingSheet === client.id}
                              onClick={() => handleCheckSheet(client.id)}
                              title="Check sheet health"
                            >
                              {checkingSheet === client.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(client.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                              title="Delete client"
                              onClick={() => handleDelete(client)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4 text-center">
        <CreditLink />
      </footer>
    </div>
  );
}
