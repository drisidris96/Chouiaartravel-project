import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, Shield, Calendar, Edit3, Save, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API = BASE_URL.replace(/\/$/, "") + "/api";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, lang } = useLanguage();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [emailLoading, setEmailLoading] = useState(false);

  const [fullUser, setFullUser] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setFullUser(data);
        setProfileForm({ name: data.name || "", phone: data.phone || "" });
      })
      .catch(() => {});
  }, []);

  if (isLoading || !user) return null;

  const userData = fullUser || user;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: profileForm.name, phone: profileForm.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFullUser(data.user);
      setEditingProfile(false);
      toast({ title: t("profile.updateSuccess") });
      window.location.reload();
    } catch (err: any) {
      toast({ variant: "destructive", title: t("profile.updateFailed"), description: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast({ variant: "destructive", title: t("profile.passwordMismatch") });
      return;
    }
    if (passwordForm.new.length < 6) {
      toast({ variant: "destructive", title: t("profile.passwordMin") });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowPasswordForm(false);
      setPasswordForm({ current: "", new: "", confirm: "" });
      toast({ title: t("profile.passwordChanged") });
    } catch (err: any) {
      toast({ variant: "destructive", title: t("profile.passwordChangeFailed"), description: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.password) {
      toast({ variant: "destructive", title: t("profile.allRequired") });
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail: emailForm.newEmail, password: emailForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFullUser(data.user);
      setShowEmailForm(false);
      setEmailForm({ newEmail: "", password: "" });
      toast({ title: t("profile.emailChanged") });
      window.location.reload();
    } catch (err: any) {
      toast({ variant: "destructive", title: t("profile.emailChangeFailed"), description: err.message });
    } finally {
      setEmailLoading(false);
    }
  };

  const formatDate = (d: string) => {
    try {
      const locale = lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
      return new Date(d).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4">
      <div className="container mx-auto max-w-2xl space-y-6">

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-4 border-primary/20">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold">{userData.name}</h1>
          <p className="text-muted-foreground mt-1">{userData.email}</p>
          {userData.role === "admin" && (
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mt-2">
              <Shield className="w-3.5 h-3.5" />
              {t("profile.admin")}
            </span>
          )}
        </div>

        <Card className="shadow-lg border-none rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t("profile.personalInfo")}
              </CardTitle>
              {!editingProfile ? (
                <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => setEditingProfile(true)}>
                  <Edit3 className="w-4 h-4" />
                  {t("profile.edit")}
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setEditingProfile(false)}>
                  <X className="w-4 h-4" />
                  {t("profile.cancel")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!editingProfile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">{t("profile.fullName")}</span>
                  <span className="font-medium">{userData.name}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">{t("profile.email")}</span>
                  <span className="font-medium" dir="ltr">{userData.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">{t("profile.phone")}</span>
                  <span className={`font-medium ${userData.phone ? "" : "text-muted-foreground italic"}`} dir="ltr">
                    {userData.phone || t("profile.notSet")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">{t("profile.accountStatus")}</span>
                  <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {t("profile.active")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground text-sm">{t("profile.createdAt")}</span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {formatDate(userData.createdAt)}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{t("profile.fullName")}</Label>
                  <Input
                    required
                    className="h-12 bg-muted/50 rounded-xl"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("profile.phone")}</Label>
                  <Input
                    type="tel"
                    dir="ltr"
                    className="h-12 bg-muted/50 rounded-xl"
                    placeholder="+213 XX XX XX XX"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl gap-2" disabled={profileLoading}>
                  <Save className="w-4 h-4" />
                  {profileLoading ? t("profile.saving") : t("profile.save")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                {t("profile.changePassword")}
              </CardTitle>
              {!showPasswordForm ? (
                <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => setShowPasswordForm(true)}>
                  <Edit3 className="w-4 h-4" />
                  {t("profile.change")}
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => { setShowPasswordForm(false); setPasswordForm({ current: "", new: "", confirm: "" }); }}>
                  <X className="w-4 h-4" />
                  {t("profile.cancel")}
                </Button>
              )}
            </div>
            {!showPasswordForm && (
              <CardDescription>{t("profile.changePasswordDesc")}</CardDescription>
            )}
          </CardHeader>
          {showPasswordForm && (
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{t("profile.currentPassword")}</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      required
                      dir="ltr"
                      className="h-12 bg-muted/50 rounded-xl pl-10"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("profile.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      required
                      dir="ltr"
                      className="h-12 bg-muted/50 rounded-xl pl-10"
                      minLength={6}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("profile.confirmNewPassword")}</Label>
                  <Input
                    type="password"
                    required
                    dir="ltr"
                    className="h-12 bg-muted/50 rounded-xl"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl gap-2" disabled={passwordLoading}>
                  <Lock className="w-4 h-4" />
                  {passwordLoading ? t("profile.changingPassword") : t("profile.changePasswordBtn")}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        <Card className="shadow-lg border-none rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                {t("profile.changeEmail")}
              </CardTitle>
              {!showEmailForm ? (
                <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => setShowEmailForm(true)}>
                  <Edit3 className="w-4 h-4" />
                  {t("profile.change")}
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => { setShowEmailForm(false); setEmailForm({ newEmail: "", password: "" }); }}>
                  <X className="w-4 h-4" />
                  {t("profile.cancel")}
                </Button>
              )}
            </div>
            {!showEmailForm && (
              <CardDescription>{t("profile.currentEmail")} <span dir="ltr" className="font-medium">{userData.email}</span></CardDescription>
            )}
          </CardHeader>
          {showEmailForm && (
            <CardContent>
              <form onSubmit={handleEmailChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{t("profile.newEmail")}</Label>
                  <Input
                    type="email"
                    required
                    dir="ltr"
                    className="h-12 bg-muted/50 rounded-xl"
                    placeholder="new@example.com"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("profile.passwordConfirm")}</Label>
                  <Input
                    type="password"
                    required
                    dir="ltr"
                    className="h-12 bg-muted/50 rounded-xl"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl gap-2" disabled={emailLoading}>
                  <Mail className="w-4 h-4" />
                  {emailLoading ? t("profile.changingEmail") : t("profile.changeEmailBtn")}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

      </div>
    </div>
  );
}
