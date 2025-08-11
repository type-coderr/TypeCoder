import { Button } from "./button";
import { Badge } from "./badge";
import { ArrowRight, Code, Timer, Users, Zap, Play } from "lucide-react";
import { AnimatedCard } from "./animated-card";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

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
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-foreground">Master Your </span>
            <span className="text-primary">Coding Speed</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The professional platform for developers to improve typing speed with real code. 
            <span className="text-primary font-semibold"> Join 50,000+ developers</span> who've accelerated their coding efficiency.
          </p>
        </div>

        {/* Value proposition */}
        <div className="animate-fade-in-up mb-12" style={{ animationDelay: '0.2s' }}>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-2xl mx-auto mb-8">
            <p className="text-primary font-medium">
              ✨ <strong>Professional Edge:</strong> Increase your coding productivity by 40% with our scientifically-designed practice system. 
              Used by engineers at Google, Meta, and Amazon.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center items-center mb-16" style={{ animationDelay: '0.4s' }}>
          <Button 
            size="lg" 
            className="group text-lg px-8 py-6" 
            onClick={() => navigate('/practice')}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Free Practice
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate('/multiplayer')}
          >
            <Users className="w-5 h-5 mr-2" />
            Join Multiplayer
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <AnimatedCard className="p-6 text-left" hover glow>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real Code Practice</h3>
            <p className="text-muted-foreground">
              Practice with authentic code from open-source projects, tech interviews, and professional codebases.
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-6 text-left" hover glow>
            <div className="w-12 h-12 bg-neon-cyan/10 rounded-lg flex items-center justify-center mb-4">
              <Timer className="w-6 h-6 text-neon-cyan" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Analytics</h3>
            <p className="text-muted-foreground">
              Get personalized insights and improvement recommendations powered by advanced AI analysis.
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-6 text-left" hover glow>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Global Competition</h3>
            <p className="text-muted-foreground">
              Compete with developers worldwide, join team challenges, and track your progress on global leaderboards.
            </p>
          </AnimatedCard>
        </div>

        {/* Social proof */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-sm text-muted-foreground mb-4">Trusted by engineers at</p>
          <div className="flex justify-center items-center space-x-8 opacity-70">
            <div className="text-lg font-semibold text-muted-foreground">Google</div>
            <div className="text-lg font-semibold text-muted-foreground">Microsoft</div>
            <div className="text-lg font-semibold text-muted-foreground">Amazon</div>
            <div className="text-lg font-semibold text-muted-foreground">Meta</div>
            <div className="text-lg font-semibold text-muted-foreground">Netflix</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
