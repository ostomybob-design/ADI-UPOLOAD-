import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Ostomy Content Hub',
  description: 'Terms of service for our ostomy awareness and education platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using our ostomy awareness and education platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                2. Description of Service
              </h2>
              <p>
                Our Service provides educational content about ostomy care and awareness through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Curated articles and resources from publicly available sources</li>
                <li>AI-generated summaries and social media posts</li>
                <li>Community engagement through Facebook and Instagram</li>
                <li>Educational materials and support information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                3. User Responsibilities
              </h2>
              <p>When using our Service, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information when interacting with our platform</li>
                <li>Use the Service only for lawful purposes</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Not use automated systems to scrape or collect data from our Service</li>
                <li>Not post harmful, offensive, or inappropriate content in comments or messages</li>
                <li>Not impersonate others or misrepresent your affiliation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                4. Medical Disclaimer
              </h2>
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 rounded-lg">
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  IMPORTANT: This is not medical advice
                </p>
                <p>
                  The content provided through our Service is for informational and educational purposes only. It is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment.
                </p>
                <p className="mt-2">
                  Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on our platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                5. Intellectual Property
              </h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">Our Content</h3>
              <p>
                The Service, including its original content, features, and functionality, is owned by us and is protected by international copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Third-Party Content</h3>
              <p>
                We curate and share content from publicly available sources. All third-party content remains the property of its respective owners. We provide proper attribution and links to original sources.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">User-Generated Content</h3>
              <p>
                By posting comments or other content on our social media channels, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content in connection with the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                6. Privacy and Data Protection
              </h2>
              <p>
                Your privacy is important to us. Our collection and use of personal information is described in our{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline font-semibold">
                  Privacy Policy
                </Link>
                . By using the Service, you consent to our data practices as described in the Privacy Policy.
              </p>
              <p className="mt-4">
                For information about deleting your data, please visit our{' '}
                <Link href="/data-deletion" className="text-blue-600 hover:underline font-semibold">
                  Data Deletion
                </Link>
                {' '}page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                7. Third-Party Services
              </h2>
              <p>
                Our Service integrates with third-party platforms including Facebook, Instagram, OpenAI, and Supabase. Your use of these platforms is subject to their respective terms of service and privacy policies.
              </p>
              <p className="mt-4">
                We are not responsible for the content, privacy practices, or terms of service of any third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                8. Disclaimer of Warranties
              </h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties that the Service will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy, reliability, or completeness of content</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                9. Limitation of Liability
              </h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to or use of our servers</li>
                <li>Any interruption or cessation of transmission to or from the Service</li>
                <li>Any bugs, viruses, or other harmful code</li>
                <li>Any errors or omissions in content</li>
                <li>Any reliance on content provided through the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                10. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless our platform, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your access to or use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you post or share through the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                11. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these Terms</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Technical or security reasons</li>
              </ul>
              <p className="mt-4">
                Upon termination, your right to use the Service will immediately cease. Provisions that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                12. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
              <p className="mt-4">
                Any disputes arising from these Terms or the Service shall be resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                13. Changes to the Service
              </h2>
              <p>
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                14. Severability
              </h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                15. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
                <p><strong>Email:</strong> [email]</p>
                <p><strong>Address:</strong> [address]</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Please replace the bracketed placeholders with your actual contact information.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
              href="/data-deletion"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Data Deletion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
