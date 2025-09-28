import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Cricket Tournament 2025</h1>
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Player Registration – Cricket Tournament 2025
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the most exciting cricket event of the year. Register now and showcase your skills on the field!
          </p>
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 py-4">
              Register as a Player
            </Button>
          </Link>
        </div>

        {/* Tournament Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Tournament Dates</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">November 15–25, 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Venue</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">JLN Stadium, Kochi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <User className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Open for all registered players</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Prize Pool</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">₹50,000</p>
            </CardContent>
          </Card>
        </div>

        {/* Player Registration Requirements */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Player Registration Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-1 gap-6">
              <div className="text-center">
                <div className="inline-block text-left">
                  <h3 className="font-semibold mb-3">You’ll need to provide:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Full name</li>
                    <li>• Playing role</li>
                    <li>• Date of birth</li>
                    <li>• Contact details</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="text-center pt-6">
              <Link to="/register">
                <Button size="lg">
                  Start Player Registration
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Landing;
