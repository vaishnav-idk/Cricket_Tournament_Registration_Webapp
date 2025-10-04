import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// --- Form Constants & Schema ---
const playerProfiles = ["Batter", "Bowler", "Batting Allrounder", "Bowling Allrounder", "Wicket Keeper"] as const;
const battingStyles = ["Right", "Left"] as const;
const bowlingStyles = ["Right Pace", "Right Spin", "Left Pace", "Left Spin"] as const;
const menRelationships = ["Self", "Spouse"] as const;
const womenRelationships = ["Self", "Spouse", "Ward"] as const;

// const playerSchema = z.object({
//   league: z.enum(["men", "women"], { required_error: "Please select a league" }),
//   club_member_name: z.string().min(2, "Club member name is required"),
//   code_number: z.number({ required_error: "Code number is required" }).positive(),
//   player_name: z.string().min(2, "Player name is required"),
//   relationship: z.string({ required_error: "Please select a relationship" }),
//   date_of_birth: z.string().min(1, "Date of birth is required"),
//   contact: z.string().length(10, "Contact must be 10 digits"),
//   player_profile: z.enum(playerProfiles, { required_error: "Please select a profile" }),
//   batting_style: z.enum(battingStyles).optional(),
//   bowling_style: z.enum(bowlingStyles).optional(),
//   available_on_jan_10_2026: z.boolean().default(false),
//   available_on_jan_11_2026: z.boolean().default(false),
//   available_on_jan_18_2026: z.boolean().default(false),
// }).superRefine((data, ctx) => {
//     if (data.league === 'men' && !menRelationships.includes(data.relationship as any)) {
//       ctx.addIssue({ path: ["relationship"], message: "Invalid relationship" });
//     }
//     if (data.league === 'women' && !womenRelationships.includes(data.relationship as any)) {
//       ctx.addIssue({ path: ["relationship"], message: "Invalid relationship" });
//     }
//     if (data.relationship === 'Self' && data.club_member_name.trim().toLowerCase() !== data.player_name.trim().toLowerCase()) {
//         ctx.addIssue({ path: ["player_name"], message: "Player name must match club member name" });
//     }
//     // CORRECTED: Batting style is NOT required for Wicket Keeper
//     if (["Batter", "Batting Allrounder", "Bowling Allrounder"].includes(data.player_profile) && !data.batting_style) {
//         ctx.addIssue({ path: ["batting_style"], message: "Batting style is required for this profile" });
//     }
//     if (["Bowler", "Batting Allrounder", "Bowling Allrounder"].includes(data.player_profile) && !data.bowling_style) {
//         ctx.addIssue({ path: ["bowling_style"], message: "Bowling style is required for this profile" });
//     }
// });
const playerSchema = z.object({
  league: z.enum(["men", "women"], { required_error: "Please select a league" }),
  club_member_name: z.string().min(2, "Club member name is required"),
  code_number: z.number({ required_error: "Code number is required" }).positive(),
  player_name: z.string().min(2, "Player name is required"),
  relationship: z.string({ required_error: "Please select a relationship" }),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  contact: z.string().length(10, "Contact must be 10 digits"),
  player_profile: z.enum(playerProfiles, { required_error: "Please select a profile" }),
  batting_style: z.enum(battingStyles).optional(),
  bowling_style: z.enum(bowlingStyles).optional(),
  available_on_jan_10_2026: z.boolean().default(false),
  available_on_jan_11_2026: z.boolean().default(false),
  available_on_jan_18_2026: z.boolean().default(false),
}).superRefine((data, ctx) => {
    if (data.league === 'men' && !menRelationships.includes(data.relationship as any)) {
      ctx.addIssue({ path: ["relationship"], message: "Invalid relationship" });
    }
    if (data.league === 'women' && !womenRelationships.includes(data.relationship as any)) {
      ctx.addIssue({ path: ["relationship"], message: "Invalid relationship" });
    }

    if (data.relationship === 'Self' && data.club_member_name.trim().toLowerCase() !== data.player_name.trim().toLowerCase()) {
        ctx.addIssue({ path: ["player_name"], message: "Player name must match club member name" });
    }

    // CORRECTED: Batting style is NOT required for Wicket Keeper
    if (["Batter", "Batting Allrounder", "Bowling Allrounder","Wicket Keeper"].includes(data.player_profile) && !data.batting_style) {
        ctx.addIssue({ path: ["batting_style"], message: "Batting style is required for this profile" });
    }

    if (["Bowler", "Batting Allrounder", "Bowling Allrounder"].includes(data.player_profile) && !data.bowling_style) {
        ctx.addIssue({ path: ["bowling_style"], message: "Bowling style is required for this profile" });
    }

    // ✅ Restrict women’s ward registration age to 12–18
    if (data.league === "women" && data.relationship === "Ward") {
      const dob = new Date(data.date_of_birth);
      if (isNaN(dob.getTime())) {
        ctx.addIssue({ path: ["date_of_birth"], message: "Invalid date of birth" });
      } else {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const hasBirthdayPassed = 
          today.getMonth() > dob.getMonth() || 
          (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
        if (!hasBirthdayPassed) {
          age--; 
        }

        if (age < 12 || age > 18) {
          ctx.addIssue({
            path: ["date_of_birth"],
            message: "Ward must be between 12 and 18 years old for Women's league",
          });
        }
      }
    }
});


type PlayerFormData = z.infer<typeof playerSchema>;

const Registration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    mode: 'onSubmit',
  });

  const { watch, setValue, getValues, resetField } = form;
  const selectedLeague = watch("league");
  const relationship = watch("relationship");
  const clubMemberName = watch("club_member_name");
  const playerProfile = watch("player_profile");

  useEffect(() => {
    if (relationship === 'Self') setValue("player_name", clubMemberName);
  }, [relationship, clubMemberName, setValue]);
  
  useEffect(() => {
    if (getValues("relationship") !== "Self") setValue("relationship", "Self");
  }, [selectedLeague, getValues, setValue]);

  // CORRECTED: Batting style is NOT shown for Wicket Keeper
  const showBattingStyle = ["Batter", "Batting Allrounder", "Bowling Allrounder","Wicket Keeper"].includes(playerProfile);
  const showBowlingStyle = ["Bowler", "Batting Allrounder", "Bowling Allrounder","Wicket Keeper"].includes(playerProfile);

  useEffect(() => {
    if (!showBattingStyle) resetField("batting_style");
    if (!showBowlingStyle) resetField("bowling_style");
  }, [playerProfile, showBattingStyle, showBowlingStyle, resetField]);


  const onSubmit = async (data: PlayerFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("players").insert([data]);
      if (error) throw error;
      toast({ title: "Registration Successful", description: `${data.player_name} has been registered successfully!` });
      navigate("/registration-success", { state: { playerName: data.player_name } });
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const relationshipOptions = selectedLeague === 'women' ? womenRelationships : menRelationships;
  const glassInputClass = "bg-slate-900/50 border-slate-700 ring-offset-slate-900 focus-visible:ring-blue-400 text-slate-50 placeholder:text-slate-400";


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6"><Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link></div>
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 shadow-2xl shadow-blue-500/10">
            <CardHeader className="text-center"><CardTitle className="text-3xl font-hero tracking-tight text-slate-50">Player Registration</CardTitle><CardDescription className="text-slate-400">Fill in the details to join DCCL SEASON III</CardDescription></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="league"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base">League *</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-3"
                            aria-label="Select league"
                          >
                            <ToggleGroupItem
                              value="men"
                              className="justify-center py-3 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50 data-[state=on]:bg-slate-700 data-[state=on]:border-blue-400 data-[state=on]:ring-2 data-[state=on]:ring-blue-400"
                            >
                              Men's League
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="women"
                              className="justify-center py-3 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50 data-[state=on]:bg-slate-700 data-[state=on]:border-pink-400 data-[state=on]:ring-2 data-[state=on]:ring-pink-400"
                            >
                              Women's League
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                        <p className="text-xs text-slate-400">Choose exactly one league to proceed.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="club_member_name" render={({ field }) => (<FormItem><FormLabel>Your Name (Club Member) *</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} className={glassInputClass} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="code_number" render={({ field }) => (<FormItem><FormLabel>Your Code Number *</FormLabel><FormControl><Input type="number" placeholder="Enter your code" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} className={glassInputClass} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="relationship" render={({ field }) => (<FormItem><FormLabel>This registration is for my... *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={glassInputClass}><SelectValue placeholder="Select relationship"/></SelectTrigger></FormControl><SelectContent className="bg-slate-800 border-slate-700 text-slate-200">{relationshipOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="player_name" render={({ field }) => (<FormItem><FormLabel>Player's Full Name *</FormLabel><FormControl><Input placeholder="Enter the player's name" {...field} disabled={relationship === 'Self'} className={`${glassInputClass} disabled:opacity-70 disabled:cursor-not-allowed`} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player's Date of Birth *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="inline-flex w-auto bg-white text-slate-900 placeholder:text-slate-500 border-slate-300 focus-visible:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="contact" render={({ field }) => (<FormItem><FormLabel>Contact Number *</FormLabel><FormControl><Input type="tel" placeholder="10-digit number" {...field} className={glassInputClass} /></FormControl><FormMessage /></FormItem>)} />
                  
                  <FormField control={form.control} name="player_profile" render={({ field }) => (<FormItem><FormLabel>Player Profile *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={glassInputClass}><SelectValue placeholder="Select a profile" /></SelectTrigger></FormControl><SelectContent className="bg-slate-800 border-slate-700 text-slate-200">{playerProfiles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showBattingStyle && <FormField control={form.control} name="batting_style" render={({ field }) => (<FormItem><FormLabel>Batting Style *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={glassInputClass}><SelectValue placeholder="Select batting style" /></SelectTrigger></FormControl><SelectContent className="bg-slate-800 border-slate-700 text-slate-200">{battingStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />}
                    {showBowlingStyle && <FormField control={form.control} name="bowling_style" render={({ field }) => (<FormItem><FormLabel>Bowling Style *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={glassInputClass}><SelectValue placeholder="Select bowling style" /></SelectTrigger></FormControl><SelectContent className="bg-slate-800 border-slate-700 text-slate-200">{bowlingStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />}
                  </div>

                  {selectedLeague === 'men' && ( <div className="space-y-4 rounded-lg border border-slate-700 p-4 animate-fade-in"><h3 className="text-base font-medium flex items-center"><CalendarDays className="mr-2 h-4 w-4"/>Player Availability *</h3><p className="text-sm text-slate-400">Please confirm availability for all match dates.</p><FormField control={form.control} name="available_on_jan_10_2026" render={({ field }) => (<FormItem className="flex items-center justify-between"><FormLabel className="font-normal">Available on Jan 10, 2026?</FormLabel><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-slate-600 data-[state=checked]:bg-blue-500" /></FormControl></FormItem>)}/> <FormField control={form.control} name="available_on_jan_11_2026" render={({ field }) => (<FormItem className="flex items-center justify-between"><FormLabel className="font-normal">Available on Jan 11, 2026?</FormLabel><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-slate-600 data-[state=checked]:bg-blue-500" /></FormControl></FormItem>)}/> <FormField control={form.control} name="available_on_jan_18_2026" render={({ field }) => (<FormItem className="flex items-center justify-between"><FormLabel className="font-normal">Available on Jan 18, 2026?</FormLabel><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-slate-600 data-[state=checked]:bg-blue-500" /></FormControl></FormItem>)}/> </div>)}
                  <div className="flex justify-center pt-4"><Button type="submit" size="lg" disabled={!selectedLeague || isSubmitting} className="w-full sm:w-1/2 bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-400 interactive-hover hover-bounce text-lg px-6 py-5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]">{isSubmitting ? "Registering..." : "Register Player"}</Button></div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Registration;
