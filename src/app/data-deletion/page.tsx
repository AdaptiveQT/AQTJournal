import React from "react";

export default function DataDeletion() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-8">Data Deletion Instructions</h1>

                <p>
                    According to the Facebook Platform rules, we have to provide a User Data Deletion Callback URL or defined instructions for data deletion.
                </p>

                <section className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-4">How to Delete Your Data</h2>
                    <p className="mb-4">
                        If you wish to delete your account and all associated data from RetailBeastFX — The System, you can do so directly within the application or by contacting us.
                    </p>

                    <h3 className="text-lg font-medium text-white mb-2">Method 1: In-App Deletion (Coming Soon)</h3>
                    <p className="mb-4">
                        Navigate to <strong>Settings {">"} Account {">"} Delete Account</strong>. This will permanently remove your user profile, trade history, and all stored data from our database.
                    </p>

                    <h3 className="text-lg font-medium text-white mb-2">Method 2: Manual Request</h3>
                    <p>
                        Send an email to <strong>support@retailbeastfx.com</strong> with the subject "Data Deletion Request". Please send the email from the address associated with your account. We will process your request within 7 business days.
                    </p>
                </section>
            </div>
        </div>
    );
}
