"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface TestResult {
  status: "success" | "error" | "warning";
  message: string;
  [key: string]: any;
}

export default function APITestPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch("/api/late/test");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        status: "error",
        message: "Failed to run test",
        error: (error as Error).message,
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const getIcon = () => {
    if (testing) return <Loader2 className="h-6 w-6 animate-spin" />;
    if (!result) return null;

    switch (result.status) {
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getAlertVariant = () => {
    if (!result) return "default";
    switch (result.status) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Late.dev API Connection Test</CardTitle>
          <CardDescription>
            This page tests the connection to Late.dev API and verifies your API key configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTest} disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Run Test Again"
            )}
          </Button>

          {result && (
            <Alert variant={getAlertVariant()}>
              <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                  <AlertTitle className="text-lg font-semibold">
                    {result.status === "success" && "✅ Connection Successful"}
                    {result.status === "error" && "❌ Connection Failed"}
                    {result.status === "warning" && "⚠️ Warning"}
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p className="font-medium">{result.message}</p>

                    {result.hint && (
                      <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                        💡 <strong>Hint:</strong> {result.hint}
                      </p>
                    )}

                    {result.docs && (
                      <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                        📚 <strong>Documentation:</strong> {result.docs}
                      </p>
                    )}

                    {result.apiKeyPrefix && (
                      <p className="text-sm mt-2">
                        <strong>API Key:</strong> {result.apiKeyPrefix}
                      </p>
                    )}

                    {result.profilesFound !== undefined && (
                      <p className="text-sm">
                        <strong>Profiles Found:</strong> {result.profilesFound}
                      </p>
                    )}

                    {result.profiles && result.profiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold mb-2">Your Profiles:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {result.profiles.map((profile: any) => (
                            <li key={profile.id} className="text-sm">
                              {profile.name} <span className="text-muted-foreground">({profile.id})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.error && (
                      <details className="mt-3">
                        <summary className="text-sm font-semibold cursor-pointer">
                          Error Details
                        </summary>
                        <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">
                          {typeof result.error === "string"
                            ? result.error
                            : JSON.stringify(result.error, null, 2)}
                        </pre>
                      </details>
                    )}

                    {result.statusCode && (
                      <p className="text-sm mt-2">
                        <strong>HTTP Status:</strong> {result.statusCode} {result.statusText}
                      </p>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                <strong>Check Vercel Environment Variables:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                  <li>Ensure <code className="bg-background px-1 py-0.5 rounded">LATE_API_KEY</code> is set</li>
                  <li>Value should start with <code className="bg-background px-1 py-0.5 rounded">sk_</code></li>
                  <li>Applied to Production, Preview, and Development</li>
                </ul>
              </li>
              <li>
                <strong>Verify API Key:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Visit <a href="https://getlate.dev/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Late.dev API Keys</a></li>
                  <li>Check if your key is active and not expired</li>
                  <li>Generate a new key if needed</li>
                </ul>
              </li>
              <li>
                <strong>Redeploy:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>After adding/updating environment variables</li>
                  <li>Go to Deployments → Redeploy latest deployment</li>
                  <li>Wait for deployment to complete</li>
                </ul>
              </li>
              <li>
                <strong>Check Documentation:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>See <code className="bg-background px-1 py-0.5 rounded">frontend/VERCEL_ENV_SETUP.md</code></li>
                  <li>See <code className="bg-background px-1 py-0.5 rounded">frontend/LATE-DEV-DOCS.md</code></li>
                </ul>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
