import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LockKeyhole, UserPlus, KeyRound, CheckCircle, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import ReCAPTCHA from "react-google-recaptcha";

type Mode = "login" | "register" | "verify" | "forgot" | "reset" | "done";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API = BASE_URL.replace(/\/$/, "") + "/api";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const searchStr = useSearch();
  const initialMode = new URLSearchParams(searchStr).get("tab") === "register" ? "register" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [displayedCode, setDisplayedCode] = useState("");
  const [forgotValue, setForgotValue] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  if (user) {
    if (user.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/");
    }
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await res.json();

      if (res.status === 403 && data.error === "not_verified") {
        setVerifyEmail(data.email);
        setDisplayedCode(data.verificationCode || "");
        setMode("verify");
        toast({ title: t("login.notVerified"), description: t("login.notVerifiedDesc") });
        return;
      }

      if (!res.ok) throw new Error(data.message);

      toast({ title: t("login.loginSuccess") });

      if (data.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("login.loginFailed"), description: err.message || t("login.loginFailedDesc") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirm) {
      toast({ variant: "destructive", title: t("login.passwordMismatch") });
      return;
    }
    if (registerForm.password.length < 6) {
      toast({ variant: "destructive", title: t("login.passwordMin") });
      return;
    }
    if (!captchaToken) {
      toast({ variant: "destructive", title: t("login.captchaRequired") || "يرجى إكمال التحقق من الكابتشا" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone || undefined,
          password: registerForm.password,
          captchaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setVerifyEmail(registerForm.email);
      setDisplayedCode(data.verificationCode || "");
      setMode("verify");
      toast({ title: t("login.accountCreated"), description: t("login.accountCreatedDesc") });
    } catch (err: any) {
      toast({ variant: "destructive", title: t("login.createFailed"), description: err.message });
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({ title: t("login.verified") });

      if (data.user?.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
      window.location.reload();
    } catch (err: any) {
      toast({ variant: "destructive", title: t("login.verifyFailed"), description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDisplayedCode(data.verificationCode || "");
      toast({ title: t("login.codeResent") });
    } catch (err: any) {
      toast({ variant: "destructive", title: t("common.error"), description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: forgotValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMode("reset");
      toast({ title: t("login.resetSent") });
    } catch (err: any) {
      toast({ variant: "destructive", title: t("common.error"), description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNew) {
      toast({ variant: "destructive", title: t("login.passwordMismatch") });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMode("done");
    } catch (err: any) {
      toast({ variant: "destructive", title: t("login.resetFailed"), description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const tabClass = (m: Mode) =>
    `flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
      mode === m
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 relative">
      <div className="absolute inset-0 bg-[url('/images/login-bg.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden rounded-3xl relative z-10">
        <div className="h-28 bg-secondary flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/images/login-bg.jpg')] bg-cover bg-center" />
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center relative z-10 translate-y-7">
            {mode === "register" ? (
              <UserPlus className="w-7 h-7 text-primary" />
            ) : mode === "verify" ? (
              <ShieldCheck className="w-7 h-7 text-primary" />
            ) : mode === "forgot" || mode === "reset" ? (
              <KeyRound className="w-7 h-7 text-primary" />
            ) : mode === "done" ? (
              <CheckCircle className="w-7 h-7 text-green-500" />
            ) : (
              <LockKeyhole className="w-7 h-7 text-primary" />
            )}
          </div>
        </div>

        <CardHeader className="text-center pt-12 pb-4">
          <CardTitle className="text-2xl font-serif">
            {mode === "login" && t("login.loginTitle")}
            {mode === "register" && t("login.registerTitle")}
            {mode === "verify" && t("login.verifyTitle")}
            {mode === "forgot" && t("login.forgotTitle")}
            {mode === "reset" && t("login.resetTitle")}
            {mode === "done" && t("login.doneTitle")}
          </CardTitle>
          <CardDescription>
            {mode === "login" && t("login.loginDesc")}
            {mode === "register" && t("login.registerDesc")}
            {mode === "verify" && t("login.verifyDesc")}
            {mode === "forgot" && t("login.forgotDesc")}
            {mode === "reset" && t("login.resetDesc")}
            {mode === "done" && t("login.doneDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          {(mode === "login" || mode === "register") && (
            <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-6">
              <button className={tabClass("login")} onClick={() => setMode("login")}>{t("login.loginTab")}</button>
              <button className={tabClass("register")} onClick={() => setMode("register")}>{t("login.registerTab")}</button>
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("login.email")}</Label>
                <Input
                  type="email"
                  required
                  dir="ltr"
                  className="h-12 bg-muted/50 rounded-xl"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.password")}</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    required
                    dir="ltr"
                    className="h-12 bg-muted/50 rounded-xl pl-10"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-primary hover:underline w-full text-left"
              >
                {t("login.forgotLink")}
              </button>
              <Button type="submit" className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? t("login.loggingIn") : t("login.loginBtn")}
              </Button>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("login.fullName")} *</Label>
                <Input
                  required
                  className="h-12 bg-muted/50 rounded-xl"
                  placeholder={t("login.fullNamePh")}
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.email")} *</Label>
                <Input
                  type="email"
                  required
                  dir="ltr"
                  className="h-12 bg-muted/50 rounded-xl"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.phoneOptional")} <span className="text-muted-foreground text-xs">{t("login.phoneNote")}</span></Label>
                <Input
                  type="tel"
                  dir="ltr"
                  className="h-12 bg-muted/50 rounded-xl"
                  placeholder="+213 XX XX XX XX"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.password")} *</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    required
                    dir="ltr"
                    className="h-12 bg-muted/50 rounded-xl pl-10"
                    minLength={6}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.confirmPassword")} *</Label>
                <Input
                  type="password"
                  required
                  dir="ltr"
                  className="h-12 bg-muted/50 rounded-xl"
                  value={registerForm.confirm}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                />
              </div>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20" disabled={isLoading || !captchaToken}>
                {isLoading ? t("login.registering") : t("login.registerBtn")}
              </Button>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-base font-bold text-foreground">{t("login.verifyPrompt")}</p>
              </div>

              {displayedCode && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <p className="text-sm text-green-700 font-medium mb-1">{t("login.codeLabel")}</p>
                  <p className="text-3xl font-bold text-green-800 tracking-[0.3em] dir-ltr">{displayedCode}</p>
                  <p className="text-xs text-green-600 mt-1">{t("login.codeCopy")}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>{t("login.codeInput")}</Label>
                <Input
                  required
                  dir="ltr"
                  className="h-14 bg-muted/50 rounded-xl text-center tracking-[0.4em] text-2xl font-bold"
                  placeholder="000000"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20" disabled={isLoading || verifyCode.length !== 6}>
                {isLoading ? t("login.verifying") : t("login.verifyBtn")}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handleResendCode} className="text-primary hover:underline" disabled={isLoading}>
                  {t("login.resendCode")}
                </button>
                <button type="button" onClick={() => setMode("login")} className="text-muted-foreground hover:text-foreground">
                  {t("login.backToLogin")}
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 text-center">
                {t("login.forgotPrompt")}
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.emailOrPhone")}</Label>
                <Input
                  required
                  dir="ltr"
                  className="h-12 bg-muted/50 rounded-xl"
                  placeholder="example@email.com  أو  +213XXXXXXXXX"
                  value={forgotValue}
                  onChange={(e) => setForgotValue(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? t("login.searching") : t("login.sendResetCode")}
              </Button>
              <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-muted-foreground hover:text-foreground">
                {t("login.backToLogin")}
              </button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <Mail className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-700 font-medium">{t("login.resetEmailSent")}</p>
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.resetCodeInput")}</Label>
                <Input
                  required
                  dir="ltr"
                  className="h-14 bg-muted/50 rounded-xl text-center tracking-[0.4em] text-2xl font-bold"
                  placeholder="000000"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.newPassword")}</Label>
                <Input
                  type="password"
                  required
                  dir="ltr"
                  className="h-12 bg-muted/50 rounded-xl"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("login.confirmNewPassword")}</Label>
                <Input
                  type="password"
                  required
                  dir="ltr"
                  className="h-12 bg-muted/50 rounded-xl"
                  value={confirmNew}
                  onChange={(e) => setConfirmNew(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? t("login.saving") : t("login.changePassword")}
              </Button>
            </form>
          )}

          {mode === "done" && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-muted-foreground">{t("login.doneMessage")}</p>
              <Button className="w-full h-12 rounded-xl" onClick={() => setMode("login")}>
                {t("login.loginNow")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
