<script setup lang="ts">
definePageMeta({ auth: false })

useSeoMeta({
  title: 'Privacy Policy - Tab Ninja',
  description: 'Privacy Policy for Tab Ninja, the shared expense splitting app.',
})
</script>

<template>
  <UMain class="bg-gray-900 min-h-screen">
    <UContainer class="max-w-3xl py-12 px-4">
      <div class="mb-10">
        <h1 class="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p class="text-sm text-gray-500">Last updated: 6 March 2026</p>
      </div>

      <div class="space-y-10 text-gray-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p>
          This privacy policy explains how Tab Ninja collects and uses information when you use the service.
          Tab Ninja helps groups track and split shared expenses such as trips, nights out, or shared purchases.
        </p>

        <!-- 1 -->
        <section>
          <h2 class="text-xl font-semibold text-white">1. Who we are</h2>
          <p>Tab Ninja is operated by Tab Ninja Ltd., based in the United Kingdom.</p>
          <p>If you have any questions about this policy or how we handle your data, contact us at: <a href="mailto:seb@tab.ninja" class="text-primary-400 hover:underline">seb@tab.ninja</a></p>
        </section>

        <!-- 2 -->
        <section>
          <h2 class="text-xl font-semibold text-white">2. Information we collect</h2>
          <p>We collect only the information needed to operate the service.</p>

          <h3 class="text-lg font-medium text-white mt-4">Account information</h3>
          <p>When you create an account we collect:</p>
          <ul>
            <li>Your email address</li>
            <li>Your nickname</li>
          </ul>
          <p>Your email address is used to authenticate your account and send login links.</p>

          <h3 class="text-lg font-medium text-white mt-4">Tab and expense information</h3>
          <p>When you create or participate in a tab we store information related to the expenses recorded in that tab. This may include:</p>
          <ul>
            <li>Tab name</li>
            <li>Expense descriptions</li>
            <li>Amounts and currencies</li>
            <li>Itemised bill details</li>
            <li>How expenses are split</li>
            <li>Participant nicknames</li>
            <li>Participant email addresses if they register</li>
          </ul>
          <p>Participants who do not create an account may still appear in tabs using only a nickname.</p>

          <h3 class="text-lg font-medium text-white mt-4">Analytics and usage information</h3>
          <p>We use analytics tools to understand how the service is used and to improve the product. These tools may collect information such as:</p>
          <ul>
            <li>Pages visited</li>
            <li>Device and browser information</li>
            <li>Approximate location</li>
            <li>Interactions with the site</li>
          </ul>
          <p>We currently use Google Analytics and PostHog. These tools help us monitor performance, understand how the service is used, and improve the product.</p>
        </section>

        <!-- 3 -->
        <section>
          <h2 class="text-xl font-semibold text-white">3. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide the Tab Ninja service</li>
            <li>Allow users to create and manage shared expense tabs</li>
            <li>Authenticate users</li>
            <li>Improve reliability and performance</li>
            <li>Understand how the service is used</li>
            <li>Support product development and marketing</li>
          </ul>
          <p>We do not sell personal data.</p>
        </section>

        <!-- 4 -->
        <section>
          <h2 class="text-xl font-semibold text-white">4. Legal basis for processing</h2>
          <p>Under UK GDPR we process personal data on the following legal bases:</p>
          <ul>
            <li><strong class="text-white">Contract</strong> — To provide the Tab Ninja service requested by users.</li>
            <li><strong class="text-white">Legitimate interests</strong> — To operate, analyse, and improve the service.</li>
            <li><strong class="text-white">Consent</strong> — Where required for analytics or cookies.</li>
          </ul>
        </section>

        <!-- 5 -->
        <section>
          <h2 class="text-xl font-semibold text-white">5. Data sharing</h2>
          <p>We share limited data with service providers that help us operate the service. These may include analytics providers and infrastructure providers.</p>
          <p>Service providers process data on our behalf and are required to protect it. We do not sell personal data to third parties.</p>
        </section>

        <!-- 6 -->
        <section>
          <h2 class="text-xl font-semibold text-white">6. International transfers</h2>
          <p>Some service providers may process data outside the United Kingdom. Where this occurs we rely on appropriate safeguards such as contractual protections or recognised data protection frameworks.</p>
        </section>

        <!-- 7 -->
        <section>
          <h2 class="text-xl font-semibold text-white">7. Data retention</h2>
          <p>We keep personal data for as long as it is necessary to operate the service. Account information and tab data may be retained while accounts remain active so that users can access and manage their tabs and expense history.</p>
          <p>Because tabs may involve multiple participants, removing one user's account may not remove all records of their participation in shared tabs.</p>
          <p>If you would like your data removed from the service, you can request deletion by contacting us at <a href="mailto:seb@tab.ninja" class="text-primary-400 hover:underline">seb@tab.ninja</a>.</p>
        </section>

        <!-- 8 -->
        <section>
          <h2 class="text-xl font-semibold text-white">8. Your rights</h2>
          <p>Under UK GDPR you have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to certain types of processing</li>
            <li>Request a copy of your data</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:seb@tab.ninja" class="text-primary-400 hover:underline">seb@tab.ninja</a>.</p>
        </section>

        <!-- 9 -->
        <section>
          <h2 class="text-xl font-semibold text-white">9. Security</h2>
          <p>We take reasonable steps to protect personal data using secure infrastructure and access controls. However, no system can be completely secure.</p>
        </section>

        <!-- 10 -->
        <section>
          <h2 class="text-xl font-semibold text-white">10. Changes to this policy</h2>
          <p>We may update this privacy policy occasionally. When we do, the date at the top of this page will be updated.</p>
        </section>

        <!-- 11 -->
        <section>
          <h2 class="text-xl font-semibold text-white">11. Contact</h2>
          <p>For privacy-related questions please contact:</p>
          <p><a href="mailto:seb@tab.ninja" class="text-primary-400 hover:underline">seb@tab.ninja</a></p>
        </section>
      </div>
    </UContainer>
  </UMain>
</template>
