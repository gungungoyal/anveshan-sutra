/**
 * Payment Modal Component
 * Mock payment interface for unlocking organization details
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { usePurchase } from "@/hooks/usePurchase";
import { validateMockCard, validateExpiry, validateCVV, getCardBrand } from "@/lib/services/mockPayment";
import { SearchResult } from "@shared/api";

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organization: SearchResult;
    onSuccess: () => void;
}

export default function PaymentModal({
    open,
    onOpenChange,
    organization,
    onSuccess,
}: PaymentModalProps) {
    const { purchaseOrganization, isPurchasing, paymentResult, resetPaymentResult } = usePurchase();
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const amount = 99; // Mock price in INR

    // Format card number with spaces (e.g., "4242 4242 4242 4242")
    const handleCardNumberChange = (value: string) => {
        const cleaned = value.replace(/\D/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || "";
        setCardNumber(formatted);
        if (errors.cardNumber) {
            setErrors({ ...errors, cardNumber: "" });
        }
    };

    // Format expiry as MM/YY
    const handleExpiryChange = (value: string) => {
        const cleaned = value.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length >= 2) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        setExpiry(formatted);
        if (errors.expiry) {
            setErrors({ ...errors, expiry: "" });
        }
    };

    const handleCvvChange = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 4);
        setCvv(cleaned);
        if (errors.cvv) {
            setErrors({ ...errors, cvv: "" });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!cardNumber) {
            newErrors.cardNumber = "Card number is required";
        } else if (!validateMockCard(cardNumber)) {
            newErrors.cardNumber = "Invalid card number";
        }

        if (!expiry) {
            newErrors.expiry = "Expiry date is required";
        } else if (!validateExpiry(expiry)) {
            newErrors.expiry = "Invalid or expired date";
        }

        if (!cvv) {
            newErrors.cvv = "CVV is required";
        } else if (!validateCVV(cvv)) {
            newErrors.cvv = "Invalid CVV";
        }

        if (!cardholderName.trim()) {
            newErrors.cardholderName = "Cardholder name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await purchaseOrganization(
            organization.id,
            {
                cardNumber,
                expiry,
                cvv,
                cardholderName,
            },
            amount
        );

        if (result.success) {
            // Success! Close modal after a short delay
            setTimeout(() => {
                onOpenChange(false);
                onSuccess();
                resetForm();
            }, 2000);
        }
    };

    const resetForm = () => {
        setCardNumber("");
        setExpiry("");
        setCvv("");
        setCardholderName("");
        setErrors({});
        resetPaymentResult();
    };

    const handleClose = () => {
        if (!isPurchasing) {
            onOpenChange(false);
            resetForm();
        }
    };

    const cardBrand = cardNumber ? getCardBrand(cardNumber) : "";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        Unlock Organization Profile
                    </DialogTitle>
                    <DialogDescription>
                        Get full access to {organization.name}'s details
                    </DialogDescription>
                </DialogHeader>

                {/* Organization Preview */}
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{organization.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary">{organization.type}</Badge>
                                <Badge variant="outline">{organization.region}</Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-primary">₹{amount}</p>
                            <p className="text-xs text-muted-foreground">one-time</p>
                        </div>
                    </div>
                </div>

                {/* Payment Result */}
                {paymentResult && (
                    <Alert variant={paymentResult.success ? "default" : "destructive"}>
                        <div className="flex items-center gap-2">
                            {paymentResult.success ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            <AlertDescription>
                                {paymentResult.message || (paymentResult.success ? "Payment successful!" : "Payment failed")}
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* Payment Form */}
                {!paymentResult?.success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Card Number */}
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="cardNumber"
                                    placeholder="4242 4242 4242 4242"
                                    value={cardNumber}
                                    onChange={(e) => handleCardNumberChange(e.target.value)}
                                    maxLength={19}
                                    className={`pl-10 ${errors.cardNumber ? "border-destructive" : ""}`}
                                    disabled={isPurchasing}
                                />
                                {cardBrand && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        {cardBrand}
                                    </span>
                                )}
                            </div>
                            {errors.cardNumber && (
                                <p className="text-xs text-destructive">{errors.cardNumber}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Test card: 4242 4242 4242 4242
                            </p>
                        </div>

                        {/* Cardholder Name */}
                        <div className="space-y-2">
                            <Label htmlFor="cardholderName">Cardholder Name</Label>
                            <Input
                                id="cardholderName"
                                placeholder="John Doe"
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                                className={errors.cardholderName ? "border-destructive" : ""}
                                disabled={isPurchasing}
                            />
                            {errors.cardholderName && (
                                <p className="text-xs text-destructive">{errors.cardholderName}</p>
                            )}
                        </div>

                        {/* Expiry and CVV */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry</Label>
                                <Input
                                    id="expiry"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={(e) => handleExpiryChange(e.target.value)}
                                    maxLength={5}
                                    className={errors.expiry ? "border-destructive" : ""}
                                    disabled={isPurchasing}
                                />
                                {errors.expiry && (
                                    <p className="text-xs text-destructive">{errors.expiry}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                    id="cvv"
                                    placeholder="123"
                                    type="password"
                                    value={cvv}
                                    onChange={(e) => handleCvvChange(e.target.value)}
                                    maxLength={4}
                                    className={errors.cvv ? "border-destructive" : ""}
                                    disabled={isPurchasing}
                                />
                                {errors.cvv && (
                                    <p className="text-xs text-destructive">{errors.cvv}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPurchasing}
                            size="lg"
                        >
                            {isPurchasing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Pay ₹{amount}
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            🔒 Secure mock payment • No real charges
                        </p>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
