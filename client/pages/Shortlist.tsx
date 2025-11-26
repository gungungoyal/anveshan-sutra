import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Trash2,
  ExternalLink,
  FileText,
  ArrowLeft,
} from "lucide-react";

interface ShortlistOrg {
  id: string;
  name: string;
  type: string;
  region: string;
  mission: string;
  focusAreas: string[];
  alignmentScore: number;
  website?: string;
  savedAt: Date;
  notes: string;
}

const mockShortlist: ShortlistOrg[] = [
  {
    id: "org-001",
    name: "Future Educators Foundation",
    type: "NGO",
    region: "Northern India",
    mission: "Empowering rural communities through quality education",
    focusAreas: ["Education", "Livelihood"],
    alignmentScore: 92,
    website: "https://futureteachers.org",
    savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    notes: "Great alignment on education focus area. Schedule follow-up call.",
  },
  {
    id: "org-004",
    name: "Tech Skills Academy",
    type: "Incubator",
    region: "Southern India",
    mission: "Building tech talent from underrepresented communities",
    focusAreas: ["Technology", "Livelihood"],
    alignmentScore: 85,
    website: "https://techskillsacademy.com",
    savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    notes: "Potential partnership for vocational training program.",
  },
];

export default function Shortlist() {
  const [shortlist, setShortlist] = useState<ShortlistOrg[]>(mockShortlist);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const removeFromShortlist = (id: string) => {
    setShortlist(shortlist.filter((org) => org.id !== id));
  };

  const startEditingNote = (org: ShortlistOrg) => {
    setEditingNotes(org.id);
    setNoteText(org.notes);
  };

  const saveNote = (id: string) => {
    setShortlist(
      shortlist.map((org) =>
        org.id === id ? { ...org, notes: noteText } : org
      )
    );
    setEditingNotes(null);
  };

  const getDateString = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Button
          variant="ghost"
          className="mb-6"
          asChild
        >
          <Link to="/search">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            My Shortlist
          </h1>
          <p className="text-lg text-muted-foreground">
            {shortlist.length} organization{shortlist.length !== 1 ? "s" : ""}{" "}
            saved for follow-up
          </p>
        </div>

        {shortlist.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                No organizations saved yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Browse organizations and click the heart icon to add them to your shortlist
              </p>
              <Button asChild>
                <Link to="/search">Continue Searching</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {shortlist.map((org) => (
              <Card key={org.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-4 gap-6">
                    {/* Organization Info */}
                    <div className="md:col-span-3">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-1">
                            {org.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary">{org.type}</Badge>
                            <Badge variant="outline">{org.region}</Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Saved {getDateString(org.savedAt)}
                        </span>
                      </div>

                      <p className="text-foreground mb-3">{org.mission}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {org.focusAreas.map((area) => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>

                      {/* Notes Section */}
                      <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                        {editingNotes === org.id ? (
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-2 block">
                              Notes
                            </label>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                              rows={3}
                              placeholder="Add notes about this organization..."
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveNote(org.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingNotes(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-foreground mb-2">
                              {org.notes || "No notes yet"}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingNote(org)}
                              className="text-xs"
                            >
                              Edit Notes
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alignment Score & Actions */}
                    <div className="md:col-span-1">
                      <div className="bg-primary/10 rounded-lg p-4 text-center mb-4">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {org.alignmentScore}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Alignment
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          asChild
                          variant="default"
                          size="sm"
                          className="w-full"
                        >
                          <Link to={`/org-profile/${org.id}`}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Profile
                          </Link>
                        </Button>

                        {org.website && (
                          <Button
                            variant="outline"
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

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <Link to={`/ppt/${org.id}`}>
                            <FileText className="w-4 h-4 mr-2" />
                            PPT
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromShortlist(org.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
