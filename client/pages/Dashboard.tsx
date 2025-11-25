import { Link } from "react-router-dom";
import { Search, Plus, MapPin, Tag, AlertCircle } from "lucide-react";
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
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header with Step Guidance */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                Step 2 of 2
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
              Search Your Organization
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Find your organization in our database or discover other verified partners. Use filters to narrow down by focus area and region.
            </p>
          </div>

          {/* Big Prominent Search Section */}
          <div className="mb-16 p-8 sm:p-10 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border-2 border-primary/20">
            <div className="space-y-6">
              {/* Main Search Bar */}
              <div>
                <label className="block text-base font-semibold text-foreground mb-3">
                  Search Organizations
                </label>
                <div className="relative">
                  <Search className="absolute left-5 top-4 w-6 h-6 text-primary" />
                  <input
                    type="text"
                    placeholder="E.g., education, health, women empowerment, Uttar Pradesh..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-16 pr-5 py-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold text-foreground mb-3">
                    Focus Area (Optional)
                  </label>
                  <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base font-medium"
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
                  <label className="block text-base font-semibold text-foreground mb-3">
                    Region (Optional)
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base font-medium"
                  >
                    <option value="">All Regions</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? "Searching..." : "Search Organizations"}
              </button>
            </div>
          </div>

          {/* Results Stats */}
          {hasSearched && (
            <div className="grid sm:grid-cols-3 gap-4 mb-12">
              <div className="p-6 sm:p-8 bg-card rounded-xl border-2 border-border">
                <p className="text-sm sm:text-base text-muted-foreground font-semibold mb-2">
                  Organizations Found
                </p>
                <p className="text-4xl sm:text-5xl font-bold text-primary">
                  {results.length}
                </p>
              </div>
              <div className="p-6 sm:p-8 bg-card rounded-xl border-2 border-border">
                <p className="text-sm sm:text-base text-muted-foreground font-semibold mb-2">
                  Verified
                </p>
                <p className="text-4xl sm:text-5xl font-bold text-accent">
                  {results.filter((r) => r.verificationStatus === "verified").length}
                </p>
              </div>
              <div className="p-6 sm:p-8 bg-card rounded-xl border-2 border-border">
                <p className="text-sm sm:text-base text-muted-foreground font-semibold mb-2">
                  Best Match
                </p>
                <p className="text-4xl sm:text-5xl font-bold text-foreground">
                  {results.length > 0 ? Math.round(results[0].alignmentScore) : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {hasSearched && results.length > 0 ? (
            <div className="space-y-6 mb-12">
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Results</h2>
                <span className="text-lg text-muted-foreground">
                  ({results.length} {results.length === 1 ? "organization" : "organizations"})
                </span>
              </div>

              {results.map((org) => (
                <div
                  key={org.id}
                  className="p-6 sm:p-8 bg-card rounded-xl border-2 border-border hover:border-primary hover:shadow-lg transition-all"
                >
                  <div className="grid sm:grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className="sm:col-span-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                          {org.name}
                        </h3>
                        {org.verificationStatus === "verified" && (
                          <span className="px-4 py-1.5 bg-accent/10 text-accent text-sm font-bold rounded-lg">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <p className="text-base text-muted-foreground mb-4 font-medium">
                        {org.type} • {org.headquarters} • {org.region}
                      </p>

                      <p className="text-base text-foreground mb-4 leading-relaxed line-clamp-2">
                        {org.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {org.focusAreas.slice(0, 2).map((area) => (
                          <span
                            key={area}
                            className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Alignment Score + Action */}
                    <div className="sm:col-span-4 flex flex-col items-center gap-4">
                      {/* Alignment Ring */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-28 h-28">
                          <svg
                            className="w-full h-full"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="hsl(var(--muted))"
                              strokeWidth="5"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="5"
                              strokeDasharray={`${
                                (org.alignmentScore / 100) *
                                (45 * 2 * Math.PI)
                              } ${45 * 2 * Math.PI}`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {Math.round(org.alignmentScore)}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground font-semibold">
                          Match Score
                        </span>
                      </div>

                      {/* View Button */}
                      <Link
                        to={`/org-profile/${org.id}`}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold text-base text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="bg-secondary rounded-xl border-2 border-border p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                No Results Found
              </h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters. You can also submit a new organization to the database.
              </p>
              <Link
                to="/org-submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold text-base"
              >
                <Plus className="w-5 h-5" />
                Submit New Organization
              </Link>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
