import React from "react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2>
                    <p>
                        Welcome to RetailBeastFX Journal ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                        This privacy policy allows you to understand what data we collect and how we use it.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">2. Data We Collect</h2>
                    <p>
                        We may collect the following types of information:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Identity Data:</strong> Name, email address, and profile picture (via Social Login).</li>
                        <li><strong>Usage Data:</strong> Trading journal entries, performance metrics, and app preferences.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">3. How We Use Your Data</h2>
                    <p>
                        We use your data to:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Provide and maintain the Service.</li>
                        <li>Monitor the usage of the Service.</li>
                        <li>Detect, prevent, and address technical issues.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">4. Data Deletion</h2>
                    <p>
                        You have the right to request deletion of your data. Please visit our <a href="/data-deletion" className="text-blue-400 hover:underline">Data Deletion Instructions</a> page to learn how to remove your account and associated data.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at support@retailbeastfx.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
