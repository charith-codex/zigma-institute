"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuccessPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

interface RegistrationData {
  id: string;
  name: string;
  email: string;
  studentPublicId: string | null;
  idCardUrl: string | null;
  status: string;
  courses: string[];
}

export default function StudentRegistrationSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const sessionId = Array.isArray(searchParams.session_id)
    ? searchParams.session_id[0]
    : searchParams.session_id;

  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingIdCard, setGeneratingIdCard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const lastGenerationKeyRef = useRef<string | null>(null);

  const fetchRegistration = useCallback(
    async (options?: { background?: boolean }) => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const isBackground = options?.background ?? false;

      if (!isBackground) {
        setLoading(true);
      }

      try {
        const response = await fetch(
          `/api/student-registration/by-session?sessionId=${encodeURIComponent(sessionId)}`
        );

        const payload = (await response.json().catch(() => null)) as
          | RegistrationData
          | { error?: string }
          | null;

        if (!response.ok) {
          const message =
            (payload && "error" in payload && payload.error) ||
            "Failed to fetch registration data";
          throw new Error(message);
        }

        if (payload && "id" in payload) {
          setRegistration(payload as RegistrationData);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (!isBackground) {
          setLoading(false);
        }
      }
    },
    [sessionId]
  );

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  useEffect(() => {
    if (!registration?.id || registration.idCardUrl) {
      return;
    }

    const interval = window.setInterval(() => {
      fetchRegistration({ background: true });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchRegistration, registration?.id, registration?.idCardUrl]);

  const registrationId = registration?.id;
  const generationKey =
    registrationId &&
    registration?.studentPublicId &&
    !registration.idCardUrl
      ? `${registrationId}:${registration.studentPublicId}`
      : null;

  useEffect(() => {
    if (!generationKey || !registrationId) {
      return;
    }

    if (lastGenerationKeyRef.current === generationKey) {
      return;
    }

    let cancelled = false;
    lastGenerationKeyRef.current = generationKey;
    setGeneratingIdCard(true);

    const regenerateIdCard = async () => {
      try {
        const response = await fetch(
          "/api/student-registration/regenerate-id-card",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ registrationId }),
          }
        );

        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(errorBody?.error || "Unable to generate ID card");
        }

        await fetchRegistration({ background: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate ID card");
        lastGenerationKeyRef.current = null;
      } finally {
        if (!cancelled) {
          setGeneratingIdCard(false);
        }
      }
    };

    regenerateIdCard();

    return () => {
      cancelled = true;
    };
  }, [fetchRegistration, generationKey, registrationId]);

  const handleManualRefresh = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    try {
      await fetchRegistration({ background: true });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownload = async () => {
    if (!registration?.idCardUrl) return;

    try {
      const response = await fetch(registration.idCardUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${registration.studentPublicId || "student"}-id-card.svg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download ID card:", err);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="max-w-4xl w-full">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">
            Payment received successfully
          </CardTitle>
          <CardDescription className="text-base">
            Thank you for completing your online registration. Our admissions team is
            generating your student ID card and LMS credentials now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {!loading && registration?.idCardUrl && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                  Your Student ID Card
                </h3>
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={registration.idCardUrl}
                    alt="Student ID Card"
                    width={960}
                    height={560}
                    className="w-full max-w-2xl rounded-lg shadow-lg"
                    unoptimized
                  />
                  <Button onClick={handleDownload} size="lg" className="gap-2">
                    <Download className="h-5 w-5" />
                    Download ID Card
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!loading && !registration?.idCardUrl && sessionId && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                {generatingIdCard
                  ? "We are generating your ID card now. This usually takes a few seconds."
                  : "Your ID card is being generated. Please check back shortly."}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={loading || refreshing}
                >
                  {refreshing ? "Refreshing..." : "Refresh status"}
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted/60 p-4">
            <p className="text-foreground font-semibold">What happens next?</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                You will receive an email confirmation with your digital ID card and LMS
                login credentials once processing completes.
              </li>
              <li>
                Selected courses are activated automatically after approval—expect a welcome
                notification within the next few minutes.
              </li>
              <li>
                Guardians receive a copy of the credentials and the ID card link for easy access.
              </li>
            </ul>
          </div>
          {sessionId ? (
            <p className="text-xs">
              Stripe reference: <span className="font-medium text-foreground">{sessionId}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Return to homepage
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Contact admissions
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
