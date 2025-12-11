import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ExternalLink, CheckCircle2, Search as SearchIcon } from "lucide-react";
import { searchOrganizations } from "@/lib/services/organizations";
import { SearchResult } from "@shared/api";

// Use SearchResult from shared API
type Organization = SearchResult;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());

  // Filter state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedFocusArea, setSelectedFocusArea] = useState(
    searchParams.get("focus") || ""
  );
  const [selectedRegion, setSelectedRegion] = useState(
    searchParams.get("region") || ""
  );
  const [sortBy, setSortBy] = useState<"alignment" | "name" | "recency">(
    (searchParams.get("sort") as "alignment" | "name" | "recency") || "alignment"
  );

  // Search function using service layer
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await searchOrganizations({
        query: query.trim() || undefined,
        focusArea: selectedFocusArea || undefined,
        region: selectedRegion || undefined,
        sortBy: sortBy,
      });

      if (!data.success) {
        throw new Error("Search failed");
      }

      setResults(data.results || []);

      // Update filter options from the response
      if (data.focusAreas && data.focusAreas.length > 0) {
        setFocusAreas(data.focusAreas);
      }
      if (data.regions && data.regions.length > 0) {
        setRegions(data.regions);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedFocusArea, selectedRegion, sortBy]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchResults]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (selectedFocusArea) params.append("focus", selectedFocusArea);
    if (selectedRegion) params.append("region", selectedRegion);
    if (sortBy !== "alignment") params.append("sort", sortBy);

    setSearchParams(params, { replace: true });
  }, [query, selectedFocusArea, selectedRegion, sortBy, setSearchParams]);

  const toggleShortlist = (orgId: string) => {
    const newShortlist = new Set(shortlist);
    if (newShortlist.has(orgId)) {
      newShortlist.delete(orgId);
    } else {
      newShortlist.add(orgId);
    }
    setShortlist(newShortlist);
  };

  const handleClearFilters = () => {
    setQuery("");
    setSelectedFocusArea("");
    setSelectedRegion("");
    setSortBy("alignment");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Find Your Perfect Partner
          </h1>
          <p className="text-lg text-muted-foreground">
            Search and filter organizations by focus area, region, and more
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4">Filters</h3>

                  {/* Search Query */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search organizations..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10"
                      />
                    </div>
                  </div>

                  {/* Focus Area Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Focus Area
                    </label>
                    <Select
                      value={selectedFocusArea || "__all__"}
                      onValueChange={(val) => setSelectedFocusArea(val === "__all__" ? "" : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All areas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All Areas</SelectItem>
                        {focusAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Region
                    </label>
                    <Select
                      value={selectedRegion || "__all__"}
                      onValueChange={(val) => setSelectedRegion(val === "__all__" ? "" : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All Regions</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Sort By
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) =>
                        setSortBy(value as "alignment" | "name" | "recency")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alignment">Alignment Score</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="recency">Recently Added</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  No organizations found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria
                </p>
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {results.length} result{results.length !== 1 ? "s" : ""}
                </p>

                <div className="space-y-4">
                  {results.map((org) => (
                    <Card key={org.id} className="hover:border-primary transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          {/* Org Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-foreground">
                                {org.name}
                              </h3>
                              {org.verificationStatus === "verified" && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary">{org.type}</Badge>
                              <Badge variant="outline">{org.region}</Badge>
                              {org.verificationStatus && (
                                <Badge
                                  variant={
                                    org.verificationStatus === "verified"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {org.verificationStatus}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {org.mission}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {org.focusAreas?.map((area) => (
                                <Badge key={area} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Alignment Score */}
                          <div className="md:text-right">
                            <div className="bg-primary/10 rounded-lg p-4 mb-4 min-w-[150px]">
                              <div className="text-3xl font-bold text-primary mb-1">
                                {org.alignmentScore || "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Alignment Score
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-col">
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full"
                                asChild
                              >
                                <Link to={`/organization/${org.id}`}>View Details</Link>
                              </Button>
                              {org.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {org.description.length > 160
                                    ? org.description.slice(0, 157) + "..."
                                    : org.description}
                                </p>
                              )}
                              <Button
                                variant={shortlist.has(org.id) ? "default" : "outline"}
                                size="sm"
                                className="w-full"
                                onClick={() => toggleShortlist(org.id)}
                              >
                                <Heart
                                  className="w-4 h-4 mr-2"
                                  fill={shortlist.has(org.id) ? "currentColor" : "none"}
                                />
                                {shortlist.has(org.id) ? "Saved" : "Save"}
                              </Button>

                              {org.website && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full"
                                  asChild
                                >
                                  <a
                                    href={org.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Website
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
