import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Ostomy Content Hub',
  description: 'Privacy policy for our ostomy awareness and education platform',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
              <p>
                Welcome to our ostomy awareness and education platform. We are committed to protecting your privacy
                and being transparent about how we collect, use, and share information. This Privacy Policy explains
                our practices regarding data collection and usage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Content We Share</h3>
              <p>
                Our platform automatically discovers and shares educational content about ostomy care from publicly
                available sources on the internet. We curate and summarize this information to provide valuable
                resources to our community.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">User Data</h3>
              <p>
                If you interact with our platform through social media (Facebook, Instagram), we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Public profile information (name, profile picture)</li>
                <li>Engagement data (likes, comments, shares on our posts)</li>
                <li>Information you voluntarily provide in comments or messages</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Technical Information</h3>
              <p>
                When you visit our website, we may automatically collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>IP address</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide educational content about ostomy care</li>
                <li>Improve our content curation and delivery</li>
                <li>Respond to comments and messages</li>
                <li>Analyze engagement to better serve our community</li>
                <li>Comply with legal obligations</li>
                <li>Maintain platform security and prevent abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Social Media Platforms:</strong> When you interact with our content on Facebook or Instagram,
                  those platforms collect data according to their own privacy policies
                </li>
                <li>
                  <strong>Service Providers:</strong> Third-party services that help us operate our platform
                  (hosting, analytics, content delivery)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
              <p>Our platform uses the following third-party services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Facebook & Instagram:</strong> For content distribution and community engagement.
                  See <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook's Privacy Policy</a>
                </li>
                <li>
                  <strong>OpenAI:</strong> For AI-powered content summarization.
                  See <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI's Privacy Policy</a>
                </li>
                <li>
                  <strong>Supabase:</strong> For secure data storage.
                  See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase's Privacy Policy</a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information against
                unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is
                completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to or restrict certain processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
              <p>
                Our platform is not directed to children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If you believe we have collected information from
                a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies and Tracking</h2>
              <p>
                We may use cookies and similar tracking technologies to enhance your experience. You can control
                cookie preferences through your browser settings. Note that disabling cookies may affect platform
                functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by
                posting the new policy on this page and updating the "Last updated" date. We encourage you to
                review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p><strong>Email:</strong> [email]</p>
                <p><strong>Address:</strong> [address]</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Please replace the bracketed placeholders with your actual contact information.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-semibold mb-4">Medical Disclaimer</h2>
              <p className="text-sm text-muted-foreground">
                The content shared on our platform is for informational and educational purposes only. It is not
                intended as medical advice, diagnosis, or treatment. Always consult with qualified healthcare
                professionals regarding any medical conditions or concerns.
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <a
              href="/terms-of-service"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="/data-deletion"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Data Deletion
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
