import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SearchResult } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Heart,
  TrendingUp,
  Clock,
  Search,
  Plus,
} from "lucide-react";

export default function NGODashboard() {
  const [recommendations, setRecommendations] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlistCount, setShortlistCount] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Fetch recommendations for a mock organization
        // In a real app, this would use the logged-in user's org
        const response = await fetch(
          "/api/matches/recommendations?org_id=org-001&limit=6"
        );
        const data = await response.json();
        setRecommendations(data.organizations || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome Back, NGO Admin!
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Find the perfect partners and funders to scale your impact
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <Button asChild className="gap-2">
                <Link to="/search">
                  <Search className="w-5 h-5" />
                  Search Funders
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/org-submit">
                  <Plus className="w-5 h-5" />
                  Update Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Potential Matches
                </p>
                <p className="text-4xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Highly aligned partners
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Shortlisted
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {shortlistCount}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Saved for later
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Time Saved
                </p>
                <p className="text-4xl font-bold text-foreground">48</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Hours vs. manual search
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI-Recommended Matches */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                AI-Recommended Matches
              </h2>
              <p className="text-muted-foreground">
                Partners perfectly aligned with your mission
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/search">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.slice(0, 4).map((org) => (
                <Card
                  key={org.id}
                  className="hover:border-primary transition-colors"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {org.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {org.type} • {org.region}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {org.alignmentScore}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Alignment
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {org.mission}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {org.focusAreas.slice(0, 2).map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="flex-1"
                      >
                        <Link to={`/org-profile/${org.id}`}>
                          View <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShortlistCount(shortlistCount + 1)}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    Viewed XYZ Foundation
                  </p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    Generated PPT for ABC CSR
                  </p>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    Profile updated successfully
                  </p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
