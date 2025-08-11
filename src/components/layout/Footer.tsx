import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  MapPin, 
  Code, 
  Users, 
  Zap,
  BookOpen,
  Shield,
  FileText,
  HelpCircle
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">CodeRace</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The world's leading platform for improving coding typing speed. 
              Join thousands of developers who trust CodeRace to enhance their programming efficiency.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>hello@coderace.dev</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/practice" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Zap className="w-3 h-3 mr-2" />
                  Practice Mode
                </a>
              </li>
              <li>
                <a href="/multiplayer" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Users className="w-3 h-3 mr-2" />
                  Multiplayer Racing
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Code className="w-3 h-3 mr-2" />
                  Global Leaderboard
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <BookOpen className="w-3 h-3 mr-2" />
                  Learning Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/press" className="text-muted-foreground hover:text-primary transition-colors">
                  Press Kit
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/help" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <HelpCircle className="w-3 h-3 mr-2" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="/status" className="text-muted-foreground hover:text-primary transition-colors">
                  System Status
                </a>
              </li>
              <li>
                <a href="/api" className="text-muted-foreground hover:text-primary transition-colors">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
            <p>&copy; {currentYear} CodeRace Technologies, Inc. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <a href="/privacy" className="hover:text-primary transition-colors flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-primary transition-colors flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                Terms of Service
              </a>
              <a href="/cookies" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <a href="https://github.com/coderace" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://twitter.com/coderace" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://linkedin.com/company/coderace" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-success" />
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-success" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span>50,000+ Happy Developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;