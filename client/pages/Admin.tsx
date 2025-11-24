import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-display-md mb-2 text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage organization verifications, scraping jobs, and system
              operations.
            </p>
          </div>

          {/* Admin Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Pending Verifications
              </p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Verified Orgs
              </p>
              <p className="text-3xl font-bold text-accent">0</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Total Organizations
              </p>
              <p className="text-3xl font-bold text-foreground">0</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Active Scrape Jobs
              </p>
              <p className="text-3xl font-bold text-foreground">0</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex gap-4 border-b border-border">
            <button className="px-4 py-3 border-b-2 border-primary text-primary font-semibold">
              Verification Queue
            </button>
            <button className="px-4 py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground font-semibold">
              Scrape Jobs
            </button>
            <button className="px-4 py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground font-semibold">
              Users
            </button>
          </div>

          {/* Verification Queue */}
          <div className="space-y-4 mb-12">
            <div className="flex items-center justify-between p-6 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Organization Name
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Submitted 2 days ago
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-semibold flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button className="px-4 py-2 border-2 border-destructive text-destructive rounded-lg hover:bg-destructive/5 transition-colors font-semibold flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex items-center justify-center p-12 bg-secondary rounded-lg border border-border">
              <div className="text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-semibold mb-2">
                  No Pending Verifications
                </p>
                <p className="text-muted-foreground">
                  All organizations have been processed.
                </p>
              </div>
            </div>
          </div>

          {/* Scrape Jobs Section */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-heading-md mb-6 text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Scrape Jobs
            </h2>
            <div className="flex items-center justify-center p-12 bg-secondary rounded-lg border border-border">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-semibold mb-2">
                  No Active Scrape Jobs
                </p>
                <p className="text-muted-foreground">
                  Click to start a new scraping job.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
