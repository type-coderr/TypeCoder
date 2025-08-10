import { Button } from "./button";
import { Badge } from "./badge";
import { ArrowRight, Code, Timer, Users, Zap } from "lucide-react";
import { AnimatedCard } from "./animated-card";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-neon-cyan/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="animate-fade-in mb-8">
          <Badge variant="secondary" className="text-sm py-2 px-4 mb-6">
            <Zap className="w-4 h-4 mr-2" />
            The Future of Coding Practice
          </Badge>
        </div>

        {/* Main heading */}
        <div className="animate-fade-in-up space-y-6 mb-12">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            <span className="hero-gradient">Master Code</span>
            <br />
            <span className="text-foreground">Before It's Too Late</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            While others struggle with typing speed in coding interviews, 
            <span className="text-primary font-semibold"> you'll be crushing algorithms</span>. 
            Train your muscle memory with real code snippets.
          </p>
        </div>

        {/* Fear-based urgency */}
        <div className="animate-fade-in-up mb-12" style={{ animationDelay: '0.2s' }}>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-2xl mx-auto mb-8">
            <p className="text-destructive font-medium">
              ⚠️ <strong>Reality Check:</strong> Senior developers type 60+ WPM on code. 
              Most bootcamp graduates barely hit 30 WPM. Don't let typing speed kill your interview performance.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center items-center mb-16" style={{ animationDelay: '0.4s' }}>
          <a href ="https://typecoder.vercel.app/practice">
          <Button variant="hero" size="xl" className="group" onclick>
            Start Training Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          </a>
          <a href ="https://typecoder.vercel.app/multiplayer">
          <Button variant="neon" size="xl">
            <Users className="w-5 h-5 mr-2" />
            Challenge Friends
          </Button>
          </a>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <AnimatedCard className="p-6 text-left" hover glow>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real Code Snippets</h3>
            <p className="text-muted-foreground">
              Practice with actual JavaScript, Python, and C++ code from real projects and interviews.
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-6 text-left" hover glow>
            <div className="w-12 h-12 bg-neon-cyan/10 rounded-lg flex items-center justify-center mb-4">
              <Timer className="w-6 h-6 text-neon-cyan" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Live Typing Metrics</h3>
            <p className="text-muted-foreground">
              Track your WPM, accuracy, and progress with detailed analytics and improvement tips.
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-6 text-left" hover glow>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multiplayer Racing</h3>
            <p className="text-muted-foreground">
              Challenge developers worldwide in real-time coding races and climb the leaderboard.
            </p>
          </AnimatedCard>
        </div>

        {/* Social proof */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-sm text-muted-foreground mb-4">Trusted by developers at</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold">Google</div>
            <div className="text-2xl font-bold">Meta</div>
            <div className="text-2xl font-bold">Amazon</div>
            <div className="text-2xl font-bold">Netflix</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
