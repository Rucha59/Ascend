import { Link } from "react-router-dom";

export default function Privacy() {
    return (
        <div
            className="min-h-screen px-6 py-12"
            style={{ background: "#f2ede6", color: "#1c1714" }}
        >
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: "#d95a2b" }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <path
                                    d="M4 15L15 4M15 4H8M15 4V11"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <span className="font-display text-lg font-black tracking-widest">
              ASCEND
            </span>
                    </Link>

                    <Link
                        to="/"
                        className="text-sm font-medium hover:underline"
                        style={{ color: "#8a7d72" }}
                    >
                        Back to home
                    </Link>
                </div>

                {/* Main content */}
                <article
                    className="rounded-[28px] p-7 sm:p-10"
                    style={{
                        background: "#faf7f2",
                        border: "1px solid #ddd5c8",
                        boxShadow: "0 15px 45px rgba(28, 23, 20, 0.06)",
                    }}
                >
                    <p
                        className="text-xs font-semibold tracking-widest uppercase mb-3"
                        style={{ color: "#d95a2b" }}
                    >
                        Privacy
                    </p>

                    <h1 className="font-display font-black text-4xl sm:text-5xl mb-4">
                        Privacy Policy
                    </h1>

                    <p
                        className="text-sm mb-10"
                        style={{ color: "#8a7d72" }}
                    >
                        Last updated: August 31, 2026
                    </p>

                    <div className="space-y-9 text-[15px] leading-7">

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                1. About Ascend
                            </h2>
                            <p>
                                Ascend is a productivity and personal progress application that
                                helps users track challenges, habits, tasks, projects, milestones,
                                journal entries, and progress over time.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                2. Information We Collect
                            </h2>

                            <p className="mb-3">
                                When you create and use an Ascend account, we may collect and
                                process the following information:
                            </p>

                            <ul className="list-disc pl-6 space-y-2">
                                <li>Name, username, email address, and account credentials.</li>
                                <li>
                                    Habits, challenge progress, completion status, notes, and
                                    habit evidence such as photos.
                                </li>
                                <li>
                                    To-do items, due dates, priorities, notes, tags, and task
                                    completion information.
                                </li>
                                <li>
                                    Projects, milestones, deadlines, checklist items, and project
                                    progress.
                                </li>
                                <li>
                                    Journal entries and images uploaded as part of journal
                                    entries.
                                </li>
                                <li>
                                    Information associated with your use of connected Google
                                    services, as described below.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                3. Google Account and Google API Data
                            </h2>

                            <p className="mb-4">
                                Ascend allows users to sign in with Google and, when the user
                                chooses to connect Google Calendar, access certain Google
                                Calendar data required to provide the calendar integration.
                            </p>

                            <p className="mb-4">
                                Depending on the features you authorize, Ascend may access
                                Google account information such as your name and email address
                                to create and authenticate your Ascend account.
                            </p>

                            <p className="mb-4">
                                When Google Calendar integration is enabled, Ascend may access
                                calendar information necessary to display and manage calendar
                                events within the application, according to the permissions
                                granted by the user.
                            </p>

                            <p>
                                Google user data is used only to provide and improve the
                                features requested by the user. We do not sell Google user data,
                                use it for targeted advertising, or use it to determine
                                creditworthiness. We do not use Google user data for unrelated
                                purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                4. How We Use Information
                            </h2>

                            <p className="mb-3">
                                We use information collected through Ascend to:
                            </p>

                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide and authenticate access to your account.</li>
                                <li>Track habits, challenges, tasks, projects, and progress.</li>
                                <li>Store and display journal entries and uploaded evidence.</li>
                                <li>Provide Google Calendar integration when authorized.</li>
                                <li>Maintain, secure, troubleshoot, and improve Ascend.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                5. How We Store Information
                            </h2>
                            <p>
                                Account and application data is stored using the infrastructure
                                used to operate Ascend. Access to stored information is limited
                                to what is necessary to provide the service and maintain the
                                application.
                            </p>

                            <p className="mt-4">
                                We use reasonable technical and organizational safeguards
                                intended to protect account information and other stored data
                                against unauthorized access, alteration, disclosure, or
                                destruction.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                6. Sharing of Information
                            </h2>
                            <p>
                                We do not sell your personal information or Google user data.
                                Information may be processed by infrastructure and service
                                providers that are necessary to operate Ascend, such as hosting,
                                database, storage, authentication, and related service
                                providers.
                            </p>

                            <p className="mt-4">
                                We do not disclose Google user data to third parties except when
                                necessary to provide the functionality requested by the user,
                                comply with applicable law, or protect the security and rights
                                of Ascend and its users.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                7. Data Retention
                            </h2>
                            <p>
                                We retain account and application information for as long as
                                reasonably necessary to provide Ascend and maintain the user's
                                account, unless a longer retention period is required by law.
                            </p>

                            <p className="mt-4">
                                Google account and calendar information is retained only for as
                                long as necessary to provide the connected functionality or as
                                otherwise required for legitimate operational purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                8. Data Deletion
                            </h2>
                            <p className="mb-4">
                                You may request deletion of your Ascend account and associated
                                personal data by contacting us using the email address below.
                            </p>

                            <p>
                                When a valid deletion request is processed, we will delete or
                                anonymize information that we are not required to retain by law
                                or for legitimate security purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                9. Disconnecting Google Services
                            </h2>
                            <p>
                                You can revoke Ascend's access to your Google account or
                                connected Google services through your Google Account settings.
                                Revoking access prevents future access to the corresponding
                                Google data, although information already stored by Ascend may
                                remain until deleted according to this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                10. Security
                            </h2>
                            <p>
                                We take reasonable measures to protect your information,
                                including access controls and security practices appropriate to
                                the nature of the data processed. However, no internet
                                transmission or electronic storage system can be guaranteed to
                                be completely secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                11. Children's Privacy
                            </h2>
                            <p>
                                Ascend is not intended for children under the age required by
                                applicable law to provide consent to data processing. We do not
                                knowingly collect personal information from children in
                                violation of applicable law.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                12. Changes to This Policy
                            </h2>
                            <p>
                                We may update this Privacy Policy from time to time to reflect
                                changes to Ascend, its features, or applicable legal
                                requirements. The updated policy will be published on this page
                                with a revised "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display font-bold text-2xl mb-3">
                                13. Contact
                            </h2>
                            <p>
                                If you have questions about this Privacy Policy or want to
                                request deletion of your data, contact:
                            </p>

                            <p className="mt-3 font-semibold">
                                ruchasp9@gmail.com
                            </p>
                        </section>

                    </div>
                </article>

                <p
                    className="text-xs text-center mt-6"
                    style={{ color: "#8a7d72" }}
                >
                    © 2026 Ascend
                </p>
            </div>
        </div>
    );
}