import type { Metadata } from 'next';
import Link from 'next/link';
import { Trash2, AlertCircle, CheckCircle2, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions | Ostomy Content Hub',
  description: 'Instructions for requesting deletion of your personal data',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <Trash2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Data Deletion
            </h1>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-lg text-muted-foreground">
              We respect your right to control your personal data. This page explains how to request deletion of your information from our platform.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                What Data Can Be Deleted?
              </h2>
              <p>
                You can request deletion of the following types of data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Social Media Interactions:</strong> Comments, likes, and messages you've shared on our Facebook or Instagram posts
                </li>
                <li>
                  <strong>Profile Information:</strong> Any profile data collected through social media platforms
                </li>
                <li>
                  <strong>Engagement Data:</strong> Analytics and interaction history with our content
                </li>
                <li>
                  <strong>Technical Data:</strong> IP addresses, browser information, and usage logs
                </li>
                <li>
                  <strong>Communication Records:</strong> Email correspondence and support tickets
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                How to Request Data Deletion
              </h2>

              <div className="space-y-6 mt-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-l-4 border-blue-500">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-500 text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Step 1: Send a Deletion Request</h3>
                      <p className="mb-4">
                        Email us at <strong className="text-blue-600 dark:text-blue-400">[email]</strong> with the subject line "Data Deletion Request"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Include the following information in your email:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                        <li>Your full name</li>
                        <li>Email address associated with your account</li>
                        <li>Social media usernames (Facebook/Instagram) if applicable</li>
                        <li>Specific data you want deleted (or "all data")</li>
                        <li>Reason for deletion (optional)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-purple-500">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-purple-500 text-white">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Step 2: Verify Your Identity</h3>
                      <p>
                        To protect your privacy, we need to verify your identity before processing the deletion request. We may ask you to:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Confirm your email address by clicking a verification link</li>
                        <li>Provide additional identifying information</li>
                        <li>Respond from the email address associated with your account</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-500 text-white">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Step 3: Wait for Processing</h3>
                      <p>
                        We will process your request within <strong>30 days</strong> of verification. You will receive:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Confirmation email when we receive your request</li>
                        <li>Updates on the deletion progress</li>
                        <li>Final confirmation when deletion is complete</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-l-4 border-blue-600">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-600 text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Step 4: Deletion Complete</h3>
                      <p>
                        Once your data is deleted, you will receive a final confirmation email. Your data will be permanently removed from our systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Important Information
              </h2>

              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-semibold mb-3 text-amber-900 dark:text-amber-200">
                  What Happens After Deletion?
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your personal data will be permanently deleted from our active databases</li>
                  <li>Backup copies will be deleted within 90 days</li>
                  <li>You will no longer receive communications from us</li>
                  <li>Your comments on social media may remain visible (controlled by the platform)</li>
                  <li>Anonymized analytics data may be retained for statistical purposes</li>
                </ul>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
                <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-200">
                  Data We Cannot Delete
                </h3>
                <p className="mb-2">
                  We may retain certain data if required by law or for legitimate business purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Data required for legal compliance or ongoing legal proceedings</li>
                  <li>Transaction records for accounting and tax purposes</li>
                  <li>Data necessary to prevent fraud or abuse</li>
                  <li>Aggregated, anonymized data that cannot identify you</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Social Media Platform Data
              </h2>
              <p>
                Please note that data shared on Facebook and Instagram is also controlled by those platforms. To fully delete your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  <strong>Facebook:</strong> Visit{' '}
                  <a
                    href="https://www.facebook.com/help/contact/259518714718624"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Facebook's Data Deletion Help
                  </a>
                </li>
                <li>
                  <strong>Instagram:</strong> Visit{' '}
                  <a
                    href="https://help.instagram.com/contact/186020218683230"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Instagram's Data Deletion Help
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Alternative: Data Download
              </h2>
              <p>
                Before deleting your data, you may want to download a copy. Request a data export by emailing us at <strong>[email]</strong> with the subject "Data Export Request". We will provide your data in a machine-readable format within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Questions or Issues?
              </h2>
              <p>
                If you have questions about the data deletion process or encounter any issues, please contact us:
              </p>
              <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
                <p><strong>Email:</strong> [email]</p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
                <p><strong>Address:</strong> [address]</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Please replace the bracketed placeholders with your actual contact information.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                This data deletion process complies with GDPR, CCPA, and other applicable data protection regulations. For more information about how we handle your data, please review our{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline font-semibold">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
