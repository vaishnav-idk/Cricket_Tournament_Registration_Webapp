import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Download,
  LogOut,
  Trophy,
  Shield,
  Target,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

interface PlayerRecord {
  employee_code: number;
  name: string;
  role: string;
  date_of_birth: string;
  contact: string;
  email: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [filtered, setFiltered] = useState<PlayerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "Batsman" | "Bowler" | "All-Rounder"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndAdmin();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchQuery, roleFilter]);

  const checkAuthAndAdmin = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData?.user ?? null;

    if (!currentUser) {
      navigate("/admin");
      return;
    }
    setUser(currentUser);

    try {
      const { data: adminRows, error } = await supabase
        .from("admins")
        .select("auth_uid")
        .eq("auth_uid", currentUser.id)
        .maybeSingle();

      if (error) throw error;

      const admin = Boolean(adminRows);
      setIsAdmin(admin);

      if (!admin) {
        toast({
          title: "Access denied",
          description: "You are not an admin",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      fetchPlayers();
    } catch (err: any) {
      console.error("admin check error", err);
      toast({
        title: "Error",
        description: "Failed to verify admin status",
        variant: "destructive",
      });
      navigate("/admin");
    }
  };

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const { data: playersData, error } = await supabase
        .from("players")
        .select(
          "employee_code, name, role, date_of_birth, contact, email, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlayers((playersData as PlayerRecord[]) || []);
    } catch (err: any) {
      console.error("fetch players error", err);
      toast({
        title: "Error",
        description: "Failed to load players",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlayers = () => {
    let list = players;

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.contact.includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.employee_code.toString().includes(q)
      );
    }

    if (roleFilter !== "all") {
      list = list.filter(
        (p) => p.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    setFiltered(list);
  };

  const exportToExcel = () => {
    const exportData = filtered.map((p) => ({
      "Employee Code": p.employee_code,
      Name: p.name,
      Role: p.role,
      "Date of Birth": p.date_of_birth
        ? new Date(p.date_of_birth).toLocaleDateString()
        : "",
      Contact: p.contact || "",
      Email: p.email,
      "Registered At": new Date(p.created_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Player Registrations");

    const fileName = `player_registrations_${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Export Successful",
      description: `Downloaded ${filtered.length} player records`,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const stats = {
    total: players.length,
    batsmen: players.filter((p) => p.role.toLowerCase() === "batsman").length,
    bowlers: players.filter((p) => p.role.toLowerCase() === "bowler").length,
    allRounders: players.filter(
      (p) => p.role.toLowerCase() === "all-rounder"
    ).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Tournament Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Batsmen</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.batsmen}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bowlers</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bowlers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">All-Rounders</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.allRounders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Player Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, phone, employee code, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as typeof roleFilter)
                }
              >
                <option value="all">All Players</option>
                <option value="Batsman">Batsmen</option>
                <option value="Bowler">Bowlers</option>
                <option value="All-Rounder">All-Rounders</option>
              </select>

              <Button onClick={exportToExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>

            <div className="space-y-4">
              {filtered.map((p) => (
                <Card key={p.employee_code} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.role}</p>
                      <p className="text-sm text-muted-foreground">
                        Employee Code: {p.employee_code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {p.email}
                        {p.contact ? ` • ${p.contact}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Registered: {new Date(p.created_at).toLocaleString()}
                    {p.date_of_birth && (
                      <span>
                        {" "}
                        • DOB:{" "}
                        {new Date(p.date_of_birth).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No players found matching your search criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
