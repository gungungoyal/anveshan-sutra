import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
    User,
    Settings,
    Shield,
    Bell,
    Camera,
    Loader2,
    Check,
    Eye,
    EyeOff,
    Building2,
    Phone,
    Mail,
    AlertCircle,
} from "lucide-react";
import {
    getCurrentUser,
    updateProfile,
    updatePassword,
    uploadAvatar,
    AuthUser,
} from "@/lib/services/auth";

export default function ProfileSettings() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // User state
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Preferences
    const [notifications, setNotifications] = useState(true);
    const [newsletter, setNewsletter] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

    // Password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Load user data
    useEffect(() => {
        const loadUser = async () => {
            try {
                const { user, error } = await getCurrentUser();
                if (error || !user) {
                    navigate("/auth");
                    return;
                }
                setUser(user);
                setName(user.name || "");
                setPhone(user.phone || "");
                setOrganizationName(user.organization_name || "");
                setBio(user.bio || "");
                setAvatarUrl(user.avatar_url || "");
                setNotifications(user.preferences?.notifications ?? true);
                setNewsletter(user.preferences?.newsletter ?? false);
                setTheme(user.preferences?.theme ?? "system");
            } catch (err) {
                console.error("Failed to load user:", err);
                navigate("/auth");
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [navigate]);

    // Get user initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle avatar upload
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file.",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 5MB.",
                variant: "destructive",
            });
            return;
        }

        setUploadingAvatar(true);
        try {
            const { url, error } = await uploadAvatar(file);
            if (error) {
                toast({
                    title: "Upload failed",
                    description: error,
                    variant: "destructive",
                });
                return;
            }
            if (url) {
                setAvatarUrl(url);
                toast({
                    title: "Avatar updated",
                    description: "Your profile picture has been updated.",
                });
            }
        } catch (err) {
            toast({
                title: "Upload failed",
                description: "Failed to upload avatar. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Save profile changes
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const { success, error } = await updateProfile({
                name,
                phone,
                organization_name: organizationName,
                bio,
            });

            if (error) {
                toast({
                    title: "Update failed",
                    description: error,
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Profile updated",
                description: "Your profile has been saved successfully.",
            });
        } catch (err) {
            toast({
                title: "Update failed",
                description: "Failed to save profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    // Save preferences
    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            const { success, error } = await updateProfile({
                preferences: {
                    notifications,
                    newsletter,
                    theme,
                },
            });

            if (error) {
                toast({
                    title: "Update failed",
                    description: error,
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Preferences saved",
                description: "Your preferences have been updated.",
            });
        } catch (err) {
            toast({
                title: "Update failed",
                description: "Failed to save preferences. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        // Validate
        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "Please make sure your new passwords match.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: "Password too short",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            });
            return;
        }

        setChangingPassword(true);
        try {
            const { success, error } = await updatePassword(currentPassword, newPassword);

            if (error) {
                toast({
                    title: "Password change failed",
                    description: error,
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Password changed",
                description: "Your password has been updated successfully.",
            });

            // Clear form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            toast({
                title: "Password change failed",
                description: "Failed to change password. Please try again.",
                variant: "destructive",
            });
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="pt-8 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-lg text-muted-foreground font-medium">
                            Loading your profile...
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-8 pb-20 px-4 sm:px-6">
                <div className="container mx-auto max-w-4xl">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                            Profile Settings
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    {/* Profile Card with Avatar */}
                    <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2">
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                {/* Avatar */}
                                <div className="relative group">
                                    <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
                                        <AvatarImage src={avatarUrl} alt={name} />
                                        <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                            {getInitials(name || "U")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        onClick={handleAvatarClick}
                                        disabled={uploadingAvatar}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        ) : (
                                            <Camera className="w-8 h-8 text-white" />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* User Info */}
                                <div className="text-center sm:text-left flex-1">
                                    <h2 className="text-2xl font-bold text-foreground mb-1">{name}</h2>
                                    <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                                        <Mail className="w-4 h-4" />
                                        {user?.email}
                                    </p>
                                    {organizationName && (
                                        <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                                            <Building2 className="w-4 h-4" />
                                            {organizationName}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                                            {user?.role}
                                        </span>
                                        {user?.verified && (
                                            <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-medium flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings Tabs */}
                    <Tabs defaultValue="account" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-2 bg-secondary/50">
                            <TabsTrigger
                                value="account"
                                className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Account</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="personal"
                                className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Building2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Personal</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="preferences"
                                className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="hidden sm:inline">Preferences</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Shield className="w-4 h-4" />
                                <span className="hidden sm:inline">Security</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Account Tab */}
                        <TabsContent value="account">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Account Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your display name and basic account details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Display Name</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="max-w-md"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="max-w-md bg-muted"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Email cannot be changed. Contact support if needed.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Account Type</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="px-4 py-2 bg-secondary rounded-lg font-medium capitalize">
                                                {user?.role}
                                            </span>
                                        </div>
                                    </div>

                                    <Button onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Personal Information Tab */}
                        <TabsContent value="personal">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>
                                        Add more details about yourself and your organization
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative max-w-md">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="organization">Organization Name</Label>
                                        <div className="relative max-w-md">
                                            <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="organization"
                                                value={organizationName}
                                                onChange={(e) => setOrganizationName(e.target.value)}
                                                placeholder="Your organization or company"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio / About</Label>
                                        <Textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell us a bit about yourself or your work..."
                                            rows={4}
                                            className="max-w-lg resize-none"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            {bio.length}/500 characters
                                        </p>
                                    </div>

                                    <Button onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Preferences Tab */}
                        <TabsContent value="preferences">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-primary" />
                                        Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        Customize your notification and display preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between max-w-md p-4 bg-secondary/30 rounded-lg">
                                            <div>
                                                <Label htmlFor="notifications" className="font-medium">
                                                    Push Notifications
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive notifications about matches and updates
                                                </p>
                                            </div>
                                            <Switch
                                                id="notifications"
                                                checked={notifications}
                                                onCheckedChange={setNotifications}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between max-w-md p-4 bg-secondary/30 rounded-lg">
                                            <div>
                                                <Label htmlFor="newsletter" className="font-medium">
                                                    Newsletter
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive weekly updates and insights via email
                                                </p>
                                            </div>
                                            <Switch
                                                id="newsletter"
                                                checked={newsletter}
                                                onCheckedChange={setNewsletter}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="font-medium">Theme</Label>
                                        <div className="flex flex-wrap gap-3 max-w-md">
                                            {(["light", "dark", "system"] as const).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTheme(t)}
                                                    className={`px-4 py-2 rounded-lg border-2 font-medium capitalize transition-all ${theme === t
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={handleSavePreferences} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Save Preferences
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Security
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your password and security settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 max-w-md">
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-amber-800 dark:text-amber-200">
                                                Password Security
                                            </p>
                                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                                Make sure to use a strong, unique password that you don't use elsewhere.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="Enter current password"
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Minimum 8 characters
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                        variant="destructive"
                                    >
                                        {changingPassword ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Changing Password...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-4 h-4 mr-2" />
                                                Change Password
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
}
