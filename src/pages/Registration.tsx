import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const playerRoles = [
  "Batsman",
  "Bowler",
  "All-rounder",
] as const;

// Utility to check minimum age
const isAtLeastAge = (dob: string, age: number) => {
  const birthDate = new Date(dob);
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - age,
    today.getMonth(),
    today.getDate()
  );
  return birthDate <= minDate;
};

// Zod schema with updated validation
const playerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
  employee_code: z
    .number({
      required_error: "Employee code is required",
      invalid_type_error: "Employee code must be a number",
    })
    .positive("Employee code must be a positive number"),
  role: z.enum(playerRoles, { required_error: "Please select a role" }),
  date_of_birth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
    .refine((val) => isAtLeastAge(val, 18), {
      message: "Player must be at least 18 years old",
    }),
  contact: z
    .string()
    .min(10, "Contact number must be 10 digits")
    .max(10, "Contact number must be 10 digits")
    .regex(/^[0-9]+$/, "Contact number must contain only numbers"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
});

type PlayerFormData = z.infer<typeof playerSchema>;

const Registration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: "",
      employee_code: undefined,
      role: "Batsman",
      date_of_birth: "",
      contact: "",
      email: "",
    },
  });

  const onSubmit = async (data: PlayerFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("players").insert([
        {
          employee_code: data.employee_code,
          name: data.name.trim(),
          role: data.role,
          date_of_birth: data.date_of_birth,
          contact: data.contact.trim(),
          email: data.email?.trim().toLowerCase() || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: `${data.name} has been registered successfully!`,
      });

      navigate("/registration-success", {
        state: { playerName: data.name },
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Player Registration</CardTitle>
              <p className="text-muted-foreground">
                Fill in your details to participate in the Cricket Tournament 2025
              </p>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Employee Code */}
                  <FormField
                    control={form.control}
                    name="employee_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Code *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter employee code"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Playing Role *</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                            {...field}
                          >
                            {playerRoles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date of Birth */}
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Number */}
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter 10 digit number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email (Optional) */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <div className="flex justify-center pt-4">
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? "Registering..." : "Register Player"}
                    </Button>
                  </div>
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
