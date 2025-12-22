import { useState } from "react";
import { X, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface MoUTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    ngoName: string;
    partnerName: string;
    partnerType: string;
}

export default function MoUTemplateModal({
    isOpen,
    onClose,
    ngoName,
    partnerName,
    partnerType,
}: MoUTemplateModalProps) {
    const currentDate = new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const mouTemplate = `MEMORANDUM OF UNDERSTANDING (MoU)

BETWEEN

${ngoName}
(hereinafter referred to as "Party A")

AND

${partnerName}
(hereinafter referred to as "Party B")

---

1. PURPOSE

This Memorandum of Understanding sets forth the terms and understanding between Party A and Party B to collaborate for mutual benefit in areas of shared interest.

2. SCOPE OF COLLABORATION

The parties agree to explore collaboration in the following areas:
• [Describe specific focus areas]
• [Describe potential joint activities]
• [Describe expected outcomes]

3. RESPONSIBILITIES

Party A (${ngoName}) shall:
• [List specific responsibilities]
• [List deliverables]
• [List commitments]

Party B (${partnerName}) shall:
• [List specific responsibilities]
• [List deliverables]
• [List commitments]

4. DURATION

This MoU shall be effective from [Start Date] and shall remain in effect for a period of [Duration], unless terminated earlier by mutual consent.

5. CONFIDENTIALITY

Both parties agree to maintain confidentiality of any proprietary or sensitive information shared during the collaboration.

6. NON-BINDING NATURE

This MoU is a statement of intent and does not create any legally binding obligations between the parties. It is meant to facilitate discussions and outline areas of potential collaboration.

7. TERMINATION

Either party may terminate this MoU by providing [30 days] written notice to the other party.

8. GOVERNING LAW

This MoU shall be governed by and construed in accordance with the laws of India.

---

SIGNATURES

For ${ngoName}:

Name: ________________________
Title: ________________________
Date: ________________________
Signature: ____________________


For ${partnerName}:

Name: ________________________
Title: ________________________
Date: ________________________
Signature: ____________________

---

Draft generated on: ${currentDate}
`;

    const handleDownload = () => {
        const blob = new Blob([mouTemplate], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `MoU_${ngoName.replace(/\s+/g, "_")}_${partnerName.replace(/\s+/g, "_")}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("MoU template downloaded!");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            MoU Template
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Download and customize for your partnership
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto py-4">
                    {/* Warning Notice */}
                    <div className="p-4 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-1">
                            ⚠️ Important: Legal Review Required
                        </p>
                        <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                            This is a reference template only. Before signing any agreement,
                            please have it reviewed by your legal team or advisor. Drivya.AI
                            does not provide legal advice.
                        </p>
                    </div>

                    {/* Template Preview */}
                    <div className="bg-muted/30 rounded-lg p-6 border">
                        <pre className="whitespace-pre-wrap text-sm font-mono text-foreground leading-relaxed">
                            {mouTemplate}
                        </pre>
                    </div>
                </CardContent>

                {/* Actions */}
                <div className="flex gap-3 p-4 border-t bg-muted/30">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Close
                    </Button>
                    <Button onClick={handleDownload} className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Download Template
                    </Button>
                </div>
            </Card>
        </div>
    );
}
