import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const RegistrationSuccess = () => {
  const location = useLocation();
  const { teamName, teamId } = location.state || {};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Registration Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamName && (
              <p className="text-lg">
                Team <strong>"{teamName}"</strong> has been registered successfully.
              </p>
            )}
            {teamId && (
              <p className="text-sm text-muted-foreground">
                Registration ID: <code className="bg-muted px-2 py-1 rounded">{teamId}</code>
              </p>
            )}
            <p className="text-muted-foreground">
              Your registration is currently pending approval. You will be notified once the admin reviews your application.
            </p>
            <div className="pt-4">
              <Link to="/">
                <Button size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationSuccess;