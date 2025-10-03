import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import dolphinLogo from "../../images/Dolphin_club_logo.jpg";
import tournamentLogo from "../../images/circket_tournament_logo.jpg";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; closed: boolean };

const Landing = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  // Removed tilt effect from hero title per request

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const year = now.getFullYear();
      const closing = new Date(year, 9, 30, 23, 59, 59, 999);
      let diff = closing.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, closed: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);
      const seconds = Math.floor(diff / 1000);

      setTimeLeft({ days, hours, minutes, seconds, closed: false });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-16">
        <div id="hero-cluster" className="text-center mb-14">
          <div className="flex justify-center items-center gap-8 mb-6 animate-fade-in">
            <img
              src={dolphinLogo}
              alt="Dolphin Club"
              className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover bounce-slow shadow-lg"
            />
            <img
              src={tournamentLogo}
              alt="Cricket Tournament Registration"
              className="h-20 md:h-24 w-auto object-contain"
            />
          </div>
          {/* <h1 className="font-warpen tracking-tight text-5xl md:text-7xl mb-2 animate-fade-up bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_6px_24px_rgba(59,130,246,0.35)]">
            DCCL SEASON III
          </h1> */}
          <h1 className="font-warpen text-5xl">
    DCCL SEASON III
</h1>
          <div className="flex justify-center mb-4">
            <span className="typewriter text-xl md:text-lg font-hero opacity-90">
              Play Together.  Win Together.
            </span>
          </div>
          {/* Countdown */}
          <div className="mx-auto mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-4 rounded-xl bg-secondary text-secondary-foreground px-5 py-3 shadow">
              <span className="text-2xl md:text-3xl" aria-hidden>⏳</span>
              {timeLeft && !timeLeft.closed ? (
                <div className="flex items-end gap-4 font-hero">
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold leading-none">{timeLeft.days}</div>
                    <div className="text-xs md:text-sm opacity-80">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs md:text-sm opacity-80">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs md:text-sm opacity-80">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold leading-none">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs md:text-sm opacity-80">Seconds</div>
                  </div>
                </div>
              ) : (
                <span className="text-lg md:text-xl font-medium">Registration closed</span>
              )}
            </div>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in">
            Be part of the most exciting cricket event of the year. Register now and showcase your skills on the field!
          </p>
          <Link to="/register">
            <Button size="lg" className="interactive-hover hover-bounce text-lg px-8 py-5 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]">
              Register as a Player
            </Button>
          </Link>
        </div>

        {/* Tournament Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="interactive-hover hover-bounce transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="text-3xl mb-2">📅</div>
              <CardTitle className="text-lg md:text-xl">Tournament Dates</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Player Auction - Nov 16 <br></br>
Matches- 10,11,18 Jan
</p>
            </CardContent>
          </Card>

          <Card className="interactive-hover hover-bounce transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="text-3xl mb-2">📍</div>
              <CardTitle className="text-lg md:text-xl">Venue</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">CoPT Open Ground, Wellington island</p>
            </CardContent>
          </Card>

          <Card className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="text-3xl mb-2">👤</div>
              <CardTitle className="text-lg md:text-xl">Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground"><b>DCCL(Men's League):</b> Dolphin & Associate Members and their spouses.<br></br><br></br>


<b>DCWCL(Women's League):</b> Dolphin & Associate Members, their spouses and wards of age 12-18</p>
            </CardContent>
          </Card>
        </div>

        {/* Infinite image carousel (emoji placeholders). Replace items with real <img> tags as needed. */}
        <section className="mb-12">
          <div className="marquee">
            <div className="marquee-pingpong gap-8 py-4">
              {["🏏", "⚾", "🧤", "🎯", "🥇", "🏟️", "📸", "🎽"].concat(["🏏", "⚾", "🧤", "🎯", "🥇", "🏟️", "📸", "🎽"]).map((icon, idx) => (
                <div
                  key={idx}
                  className="bounce-slow shrink-0 w-[18rem] h-[12rem] rounded-xl bg-card border flex items-center justify-center text-[5rem] shadow-sm"
                  aria-hidden
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Player Registration Requirements
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center font-hero">Player Registration Requirements</CardTitle>
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
          </CardContent>
        </Card> */}

        {/* Contact Section */}
        <Card className="max-w-4xl mx-auto mt-12">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center font-hero">Contact the Subcommittee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[ { name: "Asif K Majeed", phone: "7994465148" }, { name: "Aravind Vijay", phone: "8129270895" }, { name: "Krishna Prasad S", phone: "8129270906" }, { name: "Logesh Karthick M", phone: "8714630992" }, { name: "Xaviour K Olassayil", phone: "8714630980" }, { name: "Sreenath B", phone: "7994435351" }, { name: "Namit M P", phone: "8714630929" }, { name: "Nandakishore P", phone: "7994230461" }, { name: "Rahul Verma", phone: "7994441162" }, { name: "Ajith", phone: "7736646119" } ].map((person) => (
                <a
                  key={person.name}
                  href={`tel:${person.phone}`}
                  className="group flex items-center justify-center text-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div>
                      <p className="font-semibold text-card-foreground">{person.name}</p>
                      <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">{person.phone}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Landing;
