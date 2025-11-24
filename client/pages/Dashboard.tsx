import { Link } from "react-router-dom";
import { Search, Plus, Heart, Clock, AlertCircle, Ring } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { SearchResult, SearchResponse } from "@shared/api";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [region, setRegion] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const focusAreas = [
    "Education",
    "Health",
    "Environment",
    "Livelihood",
    "Governance",
    "Technology",
  ];

  const regions = [
    "Northern India",
    "Southern India",
    "Eastern India",
    "Western India",
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (focusArea) params.append("focusArea", focusArea);
      if (region) params.append("region", region);
      params.append("sortBy", "alignment");

      const response = await fetch(`/api/orgs/search?${params.toString()}`);
      const data: SearchResponse = await response.json();
      setResults(data.organizations);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    // Load all organizations on mount
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-display-md mb-2 text-foreground">Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Search for organizations, view alignments, and discover partnership opportunities.
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-12 p-6 bg-card rounded-xl border border-border">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by organization name, mission, or focus area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Focus Area
                </label>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Focus Areas</option>
                  {focusAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Regions</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
                >
                  {isLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Organizations Found</p>
              <p className="text-3xl font-bold text-foreground">{results.length}</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Verified Organizations</p>
              <p className="text-3xl font-bold text-foreground">
                {results.filter((r) => r.verificationStatus === "verified").length}
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Best Alignment</p>
              <p className="text-3xl font-bold text-primary">
                {results.length > 0 ? Math.round(results[0].alignmentScore) : 0}
              </p>
            </div>
          </div>

          {/* Results */}
          {hasSearched && results.length > 0 ? (
            <div className="space-y-4 mb-12">
              <h2 className="text-heading-md text-foreground">Search Results</h2>
              {results.map((org) => (
                <Link
                  key={org.id}
                  to={`/org-profile/${org.id}`}
                  className="block p-6 bg-card rounded-lg border border-border hover:border-primary hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-heading-md text-foreground">{org.name}</h3>
                        {org.verificationStatus === "verified" && (
                          <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full font-semibold">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {org.type} • {org.headquarters} • {org.region}
                      </p>
                      <p className="text-foreground line-clamp-2">{org.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-sm text-muted-foreground">
                          {org.focusAreas.slice(0, 2).join(", ")}
                        </div>
                      </div>
                    </div>

                    {/* Alignment Score Ring */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="6"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="6"
                            strokeDasharray={`${
                              (org.alignmentScore / 100) * (35 * 2 * Math.PI)
                            } ${35 * 2 * Math.PI}`}
                            strokeLinecap="round"
                            transform="rotate(-90 40 40)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {Math.round(org.alignmentScore)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Match</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="bg-secondary rounded-xl border border-border p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-heading-md mb-2 text-foreground">No Results Found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search filters or keywords to find organizations.
              </p>
            </div>
          ) : null}

          {/* Sections Placeholder */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-accent" />
                <h3 className="text-heading-md text-foreground">Saved Organizations</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                No saved organizations yet. Click the heart icon on any organization to save it.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-heading-md text-foreground">Recent Activity</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your recent searches and actions will appear here.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
