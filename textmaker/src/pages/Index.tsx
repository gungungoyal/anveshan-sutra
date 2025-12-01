import { AuroraBackground } from "@/components/ui/aurora-background";

// This is a template for the welcome page, you must rewrite this file to your own homepage
export default function WelcomePage() {
  return (
    <AuroraBackground>
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent w-full">
        <div className="space-y-8 max-w-md text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to MGX
          </h1>
          <p className="text-lg text-muted-foreground animate-in fade-in delay-300 duration-700">
            Let's build something amazing
          </p>
        </div>
      </div>
    </AuroraBackground>
  );
}