import { useState } from "react";
import { X, Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface EmailDraftModalProps {
    isOpen: boolean;
    onClose: () => void;
    ngoName: string;
    ngoMission: string;
    partnerName: string;
    partnerType: string;
    partnerEmail?: string;
}

export default function EmailDraftModal({
    isOpen,
    onClose,
    ngoName,
    ngoMission,
    partnerName,
    partnerType,
    partnerEmail,
}: EmailDraftModalProps) {
    const [copied, setCopied] = useState(false);

    // Template email
    const defaultSubject = `Partnership Inquiry from ${ngoName}`;
    const defaultBody = `Dear ${partnerName} Team,

I hope this message finds you well. My name is [Your Name], and I represent ${ngoName}.

We are reaching out because we believe there is strong alignment between our organizations. ${ngoMission}

Based on our research, ${partnerName} has demonstrated commitment to similar goals, and we see potential for meaningful collaboration.

We would welcome the opportunity to discuss:
• How our missions align
• Potential areas for collaboration
• Next steps for a partnership conversation

Would you be available for a brief call in the coming weeks? I am happy to work around your schedule.

Thank you for considering this partnership opportunity. We look forward to hearing from you.

Best regards,
[Your Name]
[Your Title]
${ngoName}
[Your Email]
[Your Phone]`;

    const [subject, setSubject] = useState(defaultSubject);
    const [body, setBody] = useState(defaultBody);

    const handleCopy = async () => {
        const fullEmail = `Subject: ${subject}\n\n${body}`;
        await navigator.clipboard.writeText(fullEmail);
        setCopied(true);
        toast.success("Email copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenMailClient = () => {
        const mailtoUrl = `mailto:${partnerEmail || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, "_blank");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div>
                        <CardTitle>Draft Outreach Email</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Edit and send via your email client
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto py-4 space-y-4">
                    {/* To Field (display only) */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            To
                        </label>
                        <input
                            type="text"
                            value={partnerEmail || `[${partnerName} contact email]`}
                            disabled
                            className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground text-sm"
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Message
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={14}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm font-mono resize-none"
                        />
                    </div>

                    {/* Notice */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            ⚠️ This is a draft template. Review and personalize before sending.
                            Emails are NOT sent automatically — you must send via your own email client.
                        </p>
                    </div>
                </CardContent>

                {/* Actions */}
                <div className="flex gap-3 p-4 border-t bg-muted/30">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button variant="outline" onClick={handleCopy} className="flex-1 gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                    <Button onClick={handleOpenMailClient} className="flex-1 gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Open in Email
                    </Button>
                </div>
            </Card>
        </div>
    );
}
