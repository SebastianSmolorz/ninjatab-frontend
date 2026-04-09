<script setup lang="ts">
definePageMeta({ auth: false })

useSeoMeta({
  title: 'Terms of Service - Tab Ninja',
  description: 'Terms of Service for Tab Ninja, the shared expense splitting app.',
})
</script>

<template>
  <UMain class="bg-gray-900 min-h-screen">
    <UContainer class="max-w-3xl py-12 px-4">
      <div class="mb-10">
        <h1 class="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p class="text-sm text-gray-500">Last updated: 9 April 2026</p>
      </div>

      <div class="space-y-10 text-gray-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p>
          These Terms of Service govern your use of Tab Ninja. By using Tab Ninja you agree to these terms.
          If you do not agree, please do not use the service.
        </p>

        <!-- 1 -->
        <section>
          <h2 class="text-xl font-semibold text-white">1. About Tab Ninja</h2>
          <p>
            Tab Ninja is a tool that helps groups track and split shared expenses such as trips, nights out, or shared purchases.
            The service allows users to create "tabs", record expenses, and calculate how costs should be shared between participants.
          </p>
          <p>Tab Ninja does not process payments or transfer money between users.</p>
        </section>

        <!-- 2 -->
        <section>
          <h2 class="text-xl font-semibold text-white">2. Eligibility</h2>
          <p>You must be at least 18 years old to use Tab Ninja. By using the service you confirm that:</p>
          <ul>
            <li>You are legally able to enter into agreements</li>
            <li>The information you provide is accurate</li>
          </ul>
        </section>

        <!-- 3 -->
        <section>
          <h2 class="text-xl font-semibold text-white">3. Accounts</h2>
          <p>To create a tab or manage expenses you may be required to create an account. Accounts require:</p>
          <ul>
            <li>An email address</li>
            <li>A nickname</li>
          </ul>
          <p>You are responsible for maintaining access to your email account used for login. You are responsible for any activity that occurs under your account.</p>
        </section>

        <!-- 4 -->
        <section>
          <h2 class="text-xl font-semibold text-white">4. Tabs and shared expenses</h2>
          <p>Users may create tabs and invite others to participate. When you create or edit a tab you agree that:</p>
          <ul>
            <li>The information entered is accurate to the best of your knowledge</li>
            <li>You have permission to include other participants if their email address is used</li>
            <li>You will not use the service to harass, impersonate, or misrepresent others</li>
          </ul>
          <p>Tab Ninja simply records and calculates expenses. We do not guarantee the accuracy of user-entered data. Users are responsible for verifying expenses and balances within their group.</p>
          <h3 class="text-lg font-medium text-white mt-4">Tab lifecycle</h3>
          <p>A tab is intended to cover a single shared event or trip, such as a holiday, a group meal, or a shared purchase. Tabs are not intended to remain open indefinitely.</p>
          <p>Under normal circumstances, a tab may be closed automatically approximately 30 days after the first expense is added. You should ensure that any outstanding balances are reviewed and settled before this time. We will aim to give notice before a tab is automatically closed.</p>
        </section>

        <!-- 4b -->
        <section>
          <h2 class="text-xl font-semibold text-white">5. User content and uploaded images</h2>
          <p>You may upload images (such as photos of receipts or bills) when recording expenses. By uploading an image you grant Tab Ninja a limited licence to store, display, and process that image for the purpose of providing the service to you and the other participants of your tab.</p>
          <p>You are responsible for the content of any images you upload. You must not upload images that contain content that is illegal, offensive, or that violates the rights of others.</p>
          <p>Uploaded images may be processed by an AI service (Mistral) to extract expense information such as totals or itemised amounts. This processing may not always be accurate. You are responsible for reviewing and confirming any automatically extracted information.</p>
          <p>We do not claim ownership of your uploaded content. You may request deletion of your data at any time by contacting us.</p>
        </section>

        <!-- 5 -->
        <section>
          <h2 class="text-xl font-semibold text-white">6. Tab organisers and responsibility</h2>
          <p>The person who creates a tab (the organiser) is responsible for managing that tab. This includes:</p>
          <ul>
            <li>Inviting participants</li>
            <li>Adding or editing expenses</li>
            <li>Assigning how costs are shared</li>
            <li>Updating or correcting information if needed</li>
          </ul>
          <p>Organisers should ensure that participants are aware they have been added to a tab and that expense information is reasonably accurate.</p>
          <p>Participants should review expenses and balances themselves before making or requesting payments. Tab Ninja does not verify the identity of participants or confirm whether expenses are legitimate. Any disagreements or disputes regarding expenses or balances must be resolved directly between the participants.</p>
        </section>

        <!-- 6 -->
        <section>
          <h2 class="text-xl font-semibold text-white">7. Calculation of balances</h2>
          <p>Tab Ninja automatically calculates how expenses may be split between participants based on the information entered by users. These calculations are provided for convenience only.</p>
          <p>While we aim to ensure the calculations work correctly, we do not guarantee that balances or totals are accurate, especially if:</p>
          <ul>
            <li>Expenses are entered incorrectly</li>
            <li>Participants or shares are configured incorrectly</li>
            <li>Currencies or conversions are used</li>
            <li>Itemised bills are entered inaccurately</li>
          </ul>
          <p>Users are responsible for reviewing and confirming any balances before settling payments with other participants. Tab Ninja is not responsible for financial losses or disputes resulting from incorrect calculations or incorrect data entered by users.</p>
        </section>

        <!-- 7 -->
        <section>
          <h2 class="text-xl font-semibold text-white">8. Payments between users</h2>
          <p>Tab Ninja does not handle payments. Any money exchanged between participants happens outside the platform and is the responsibility of the users involved.</p>
          <p>Tab Ninja is not responsible for disputes between users regarding payments or expenses.</p>
        </section>

        <!-- 8 -->
        <section>
          <h2 class="text-xl font-semibold text-white">9. Disputes between participants</h2>
          <p>Tab Ninja is a tool for recording shared expenses and calculating suggested balances. We are not involved in payments between users and we do not verify the accuracy of expenses recorded in a tab.</p>
          <p>Any payments between participants happen outside the platform and are the responsibility of the individuals involved. If a dispute arises about:</p>
          <ul>
            <li>Whether an expense is valid</li>
            <li>How an expense was split</li>
            <li>Whether someone has paid or been repaid</li>
          </ul>
          <p>the participants must resolve the issue directly with each other. Tab Ninja is not responsible for mediating or resolving disputes between users and cannot guarantee that participants will repay amounts shown in the service.</p>
        </section>

        <!-- 9 -->
        <section>
          <h2 class="text-xl font-semibold text-white">10. Free and paid features</h2>
          <p>Some parts of the service may be free, while others may require payment. If payment is required:</p>
          <ul>
            <li>The price will be clearly displayed before purchase</li>
            <li>Payments are generally non-refundable unless required by law</li>
          </ul>
          <p>We may change pricing or introduce new features in the future.</p>
          <h3 class="text-lg font-medium text-white mt-4">Fair usage (Pro)</h3>
          <p>Pro plans may include unlimited expenses as a feature. "Unlimited" refers to normal personal or group use — for example, recording expenses for trips, meals, or shared purchases with a small group of people.</p>
          <p>You must not use a Pro plan to:</p>
          <ul>
            <li>Automate the creation of large numbers of expenses</li>
            <li>Use the service on behalf of many unrelated groups or as a commercial reseller</li>
            <li>Circumvent per-tab or per-account limits that would otherwise apply</li>
          </ul>
          <p>We reserve the right to limit, restrict, or terminate accounts that we believe are misusing unlimited features or acting in a way that is inconsistent with normal personal use.</p>
        </section>

        <!-- 10 -->
        <section>
          <h2 class="text-xl font-semibold text-white">11. Acceptable use</h2>
          <p>You must use Tab Ninja responsibly and lawfully. You agree not to:</p>
          <ul>
            <li>Break any laws</li>
            <li>Upload malicious code or attempt to interfere with or overload the service</li>
            <li>Scrape or copy the service at scale</li>
            <li>Attempt to access accounts or data that are not yours</li>
            <li>Add people to tabs in a misleading, abusive, or harassing way</li>
            <li>Send unwanted or spam invitations to email addresses</li>
            <li>Impersonate other people</li>
            <li>Create tabs for fraudulent or deceptive purposes</li>
            <li>Attempt to circumvent any limits imposed on free or paid plans</li>
          </ul>
          <p>We may investigate suspected violations and take action including removing content, restricting features, closing tabs, or suspending or terminating accounts. We reserve the right to terminate any tab or account that we reasonably believe is abusing the service or attempting to circumvent its limits.</p>
        </section>

        <!-- 11 -->
        <section>
          <h2 class="text-xl font-semibold text-white">12. Availability of the service</h2>
          <p>We aim to keep Tab Ninja available and reliable. However:</p>
          <ul>
            <li>The service may occasionally be unavailable</li>
            <li>Features may change</li>
            <li>We may update or modify the service at any time</li>
          </ul>
          <p>We do not guarantee uninterrupted access.</p>
        </section>

        <!-- 12 -->
        <section>
          <h2 class="text-xl font-semibold text-white">13. Data and privacy</h2>
          <p>Your use of the service is also governed by our Privacy Policy, which explains how we collect and use data.</p>
        </section>

        <!-- 13 -->
        <section>
          <h2 class="text-xl font-semibold text-white">14. App store distribution</h2>
          <p>Tab Ninja may be distributed through third-party app stores such as the Apple App Store and Google Play Store. When you download or use Tab Ninja through these platforms, the following applies:</p>
          <ul>
            <li>These terms are between you and Tab Ninja Ltd. only. Apple Inc. and Google LLC are not parties to these terms and have no obligation to provide maintenance, support, warranty, or liability coverage for the app.</li>
            <li>Apple and Google are not responsible for any claims you or a third party may have relating to the app, including product liability claims, consumer protection claims, or intellectual property infringement claims.</li>
            <li>Your use of the app must also comply with the applicable app store's terms of service.</li>
            <li>Apple and Google are third-party beneficiaries of these terms and may enforce them against you.</li>
          </ul>
        </section>

        <!-- 14 -->
        <section>
          <h2 class="text-xl font-semibold text-white">15. Intellectual property</h2>
          <p>The Tab Ninja service, website, and software are owned by Tab Ninja. You may use the service for personal use, but you may not:</p>
          <ul>
            <li>Copy, reverse engineer, redistribute, or commercially exploit the service without permission</li>
          </ul>
        </section>

        <!-- 15 -->
        <section>
          <h2 class="text-xl font-semibold text-white">16. Limitation of liability</h2>
          <p>Tab Ninja is provided "as is". To the maximum extent permitted by law:</p>
          <ul>
            <li>We are not liable for financial losses resulting from the use of the service</li>
            <li>We are not responsible for disputes between users</li>
            <li>We are not responsible for inaccurate expense entries made by users</li>
          </ul>
          <p>Nothing in these terms excludes liability where it cannot legally be excluded.</p>
        </section>

        <!-- 16 -->
        <section>
          <h2 class="text-xl font-semibold text-white">17. Termination</h2>
          <p>We may suspend or terminate access to the service if:</p>
          <ul>
            <li>These terms are violated</li>
            <li>The service is abused or limits are circumvented</li>
            <li>A tab or account shows signs of misuse or activity inconsistent with these terms</li>
            <li>We decide to discontinue the service</li>
          </ul>
          <p>We reserve the right to close individual tabs without closing an account where we believe a tab is being used in a way that violates these terms.</p>
          <p>Users may stop using the service at any time.</p>
        </section>

        <!-- 17 -->
        <section>
          <h2 class="text-xl font-semibold text-white">18. Changes to these terms</h2>
          <p>We may update these Terms of Service occasionally. If changes are significant we will update the date at the top of the document. Continued use of the service means you accept the updated terms.</p>
        </section>

        <!-- 18 -->
        <section>
          <h2 class="text-xl font-semibold text-white">19. Governing law</h2>
          <p>These terms are governed by the laws of England and Wales. Any disputes will be handled by courts in that jurisdiction.</p>
        </section>

        <!-- 19 -->
        <section>
          <h2 class="text-xl font-semibold text-white">20. Contact</h2>
          <p>If you have questions about these terms, contact us at:</p>
          <p><a href="mailto:seb@tab.ninja" class="text-primary-400 hover:underline">seb@tab.ninja</a></p>
        </section>
      </div>
    </UContainer>
  </UMain>
</template>
