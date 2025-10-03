import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Download, LogOut, Trophy, Shield, Target, Star, Hand, CalendarCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import * as XLSX from "xlsx";

interface PlayerRecord {
  club_member_name: string;
  code_number: number;
  player_name: string;
  relationship: string;
  date_of_birth: string;
  contact: string;
  player_profile: string;
  batting_style?: string;
  bowling_style?: string;
  created_at: string;
  league: 'men' | 'women';
  available_on_jan_10_2026: boolean;
  available_on_jan_11_2026: boolean;
  available_on_jan_18_2026: boolean;
}

const AdminDashboard = () => {
  const [allPlayers, setAllPlayers] = useState<PlayerRecord[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'men' | 'women'>('all');

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      setIsLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { navigate("/admin"); return; }
      setUser(currentUser);
      
      const { error: adminError } = await supabase.from("admins").select("id").eq("auth_uid", currentUser.id).single();
      if (adminError) {
        toast({ title: "Access Denied", description: "You are not an authorized admin.", variant: "destructive" });
        navigate("/");
        return;
      }

      try {
        let query = supabase.from("players").select("*");
        if (selectedView !== 'all') {
          query = query.eq('league', selectedView);
        }
        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) throw error;
        setAllPlayers(data || []);
      } catch (err: any) {
        setAllPlayers([]);
        toast({ title: "Error", description: `Failed to load players.`, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthAndFetch();
  }, [selectedView, navigate, toast]);

  useEffect(() => {
    let list = allPlayers;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => p.player_name.toLowerCase().includes(q) || p.club_member_name.toLowerCase().includes(q) || p.code_number.toString().includes(q));
    }
    if (roleFilter !== "all") {
      list = list.filter(p => p.player_profile === roleFilter);
    }
    setFilteredPlayers(list);
  }, [allPlayers, searchQuery, roleFilter]);

  const exportToExcel = () => {
    const exportData = filteredPlayers.map((p) => {
        const baseData: any = {
          "League": p.league === 'men' ? "Men's" : "Women's",
          "Club Member": p.club_member_name, "Code Number": p.code_number, "Player Name": p.player_name,
          "Relationship": p.relationship, "Role": p.player_profile,
          "DOB": new Date(p.date_of_birth).toLocaleDateString(), "Contact": p.contact,
          "Batting Style": p.batting_style || "N/A", "Bowling Style": p.bowling_style || "N/A",
          "Registered At": new Date(p.created_at).toLocaleString(),
        };
        if (selectedView !== 'women') {
            baseData['Available Jan 10'] = p.league === 'men' ? (p.available_on_jan_10_2026 ? "Yes" : "No") : "N/A";
            baseData['Available Jan 11'] = p.league === 'men' ? (p.available_on_jan_11_2026 ? "Yes" : "No") : "N/A";
            baseData['Available Jan 18'] = p.league === 'men' ? (p.available_on_jan_18_2026 ? "Yes" : "No") : "N/A";
        }
        return baseData;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedView.toUpperCase()} Players`);
    XLSX.writeFile(workbook, `${selectedView}_players_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast({ title: "Export Successful", description: `Downloaded ${filteredPlayers.length} player records.` });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };
  
  // UPDATED: Stats calculation uses the new role definitions
  const stats = {
    total: allPlayers.length,
    batters: allPlayers.filter(p => p.player_profile === "Batter").length,
    bowlers: allPlayers.filter(p => p.player_profile === "Bowler").length,
    allRounders: allPlayers.filter(p => ["Batting Allrounder", "Bowling Allrounder"].includes(p.player_profile)).length,
    wicketKeepers: allPlayers.filter(p => p.player_profile === "Wicket Keeper").length,
  };

  const StatCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) => (
    <Card className="bg-slate-800/50 backdrop-blur-lg border border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle><Icon className="h-4 w-4 text-slate-400" /></CardHeader>
      <CardContent><div className="text-2xl font-bold text-slate-50">{value}</div></CardContent>
    </Card>
  );

  const getTitle = () => {
    if (selectedView === 'men') return "Men's Player Registrations";
    if (selectedView === 'women') return "Women's Player Registrations";
    return "All Player Registrations";
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="" className="flex items-center space-x-2"><Trophy className="h-6 w-6 text-blue-400" /><h1 className="text-xl font-bold text-slate-50">Tournament Admin</h1></Link>
            <div className="flex items-center space-x-4"><span className="text-sm text-slate-400 hidden sm:inline">Welcome, {user?.email}</span><Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-slate-800 hover:text-slate-50"><LogOut className="h-4 w-4 mr-2" />Logout</Button></div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 animate-fade-in">
            <StatCard title="Total Players" value={stats.total} icon={Users} />
            <StatCard title="Batters" value={stats.batters} icon={Shield} />
            <StatCard title="Bowlers" value={stats.bowlers} icon={Target} />
            <StatCard title="All-Rounders" value={stats.allRounders} icon={Star} />
            <StatCard title="Wicket Keepers" value={stats.wicketKeepers} icon={Hand} />
        </div>
        <Card className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 shadow-2xl shadow-blue-500/10">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="mb-4 sm:mb-0 text-slate-50">{getTitle()}</CardTitle>
              <ToggleGroup type="single" value={selectedView} onValueChange={(v) => { if (v) setSelectedView(v as 'all' | 'men' | 'women'); }} className="border border-slate-700 rounded-md">
                <ToggleGroupItem value="all" className="data-[state=on]:bg-slate-600 data-[state=on]:text-slate-50">All</ToggleGroupItem>
                <ToggleGroupItem value="men" className="data-[state=on]:bg-blue-500 data-[state=on]:text-slate-50">Men's</ToggleGroupItem>
                <ToggleGroupItem value="women" className="data-[state=on]:bg-pink-500 data-[state=on]:text-slate-50">Women's</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search by name or code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-900/50 border-slate-700 ring-offset-slate-900 focus-visible:ring-blue-400"/></div>
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
                    <SelectTrigger className="w-full md:w-[200px] bg-slate-900/50 border-slate-700 ring-offset-slate-900 focus:ring-blue-400"><SelectValue placeholder="All Roles" /></SelectTrigger>
                    {/* UPDATED: Role filter includes 'Wicket Keeper' */}
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Batter">Batter</SelectItem>
                        <SelectItem value="Bowler">Bowler</SelectItem>
                        <SelectItem value="Batting Allrounder">Batting Allrounder</SelectItem>
                        <SelectItem value="Bowling Allrounder">Bowling Allrounder</SelectItem>
                        <SelectItem value="Wicket Keeper">Wicket Keeper</SelectItem>
                    </SelectContent>
                </Select>
                {/* REMOVED: "Keepers Only" checkbox is gone */}
                <Button onClick={exportToExcel} variant="outline" disabled={filteredPlayers.length === 0} className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-slate-50"><Download className="h-4 w-4 mr-2" /> Export</Button>
            </div>
            <div className="space-y-4">
              {isLoading ? (<div className="text-center py-8 text-slate-400">Loading players...</div>) : 
              filteredPlayers.length > 0 ? (filteredPlayers.map((p) => (
                  <Card key={`${p.code_number}-${p.player_name}`} className="p-4 bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between mb-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg text-blue-400">{p.player_name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.league === 'men' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'}`}>{p.league === 'men' ? "Men's" : "Women's"}</span>
                        </div>
                        {/* REMOVED: Special 'WK' badge is gone */}
                        <div className="text-sm text-slate-400 flex items-center gap-2 mt-1"><span>{p.player_profile}</span></div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4"><p className="text-xs text-slate-500">Code</p><p className="font-mono text-sm text-slate-300">{p.code_number}</p></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-400">
                      <p className="truncate"><span className="font-medium text-slate-300">Member: </span>{p.club_member_name} ({p.relationship})</p>
                      <p><span className="font-medium text-slate-300">Contact: </span>{p.contact}</p>
                      <p><span className="font-medium text-slate-300">DOB: </span>{new Date(p.date_of_birth).toLocaleDateString()}</p>
                      {p.batting_style && <p><span className="font-medium text-slate-300">Batting: </span>{p.batting_style}</p>}
                      {p.bowling_style && <p><span className="font-medium text-slate-300">Bowling: </span>{p.bowling_style}</p>}
                    </div>
                    {p.league === 'men' && (
                        <div className="mt-3 pt-3 border-t border-slate-800">
                            <h4 className="text-sm font-medium text-slate-300 flex items-center mb-2"><CalendarCheck className="h-4 w-4 mr-2" /> Availability</h4>
                            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                                <span>Jan 10: <span className={p.available_on_jan_10_2026 ? 'text-green-400' : 'text-red-400'}>{p.available_on_jan_10_2026 ? 'Yes' : 'No'}</span></span>
                                <span>Jan 11: <span className={p.available_on_jan_11_2026 ? 'text-green-400' : 'text-red-400'}>{p.available_on_jan_11_2026 ? 'Yes' : 'No'}</span></span>
                                <span>Jan 18: <span className={p.available_on_jan_18_2026 ? 'text-green-400' : 'text-red-400'}>{p.available_on_jan_18_2026 ? 'Yes' : 'No'}</span></span>
                            </div>
                        </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">Registered: {new Date(p.created_at).toLocaleString()}</div>
                  </Card>
                ))
              ) : (<div className="text-center py-8 text-slate-500">No players found for the selected criteria.</div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;