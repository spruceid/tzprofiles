<script lang="ts">
  import { BasePage, TextBody2 } from 'components';
</script>

<BasePage class="flex flex-col flex-1 items-center justify-center md:mx-auto lg:mx-12 xl:mx-auto pt-18 sm:pt-22 md:pt-34">
  <h2 class="text-4xl sm:text-5xl font-bold text-center">FAQ</h2>
  <div class="splash-container fade-in">
    <TextBody2 value="What is Tezos Profiles?" class="mb-2 font-bold" />
    <div class="mb-8">
      Tezos Profiles (TZP) is a web application where users can associate their
      public online identity based on social media profiles and self-attested
      information to their Tezos address.
    </div>

    <TextBody2 value="How Does it Work?" class="mb-2 font-bold" />
    <div class="mb-8">
      Users can build their profiles with the available credentials on Tezos
      Profiles. Each credential has a unique workflow that must be completed
      prior to credential issuance. Once issued and uploaded, platforms can then
      globally resolve this user-managed information to establish a creator’s
      profile.
    </div>

    <TextBody2
      value="Do You Plan on Supporting Additional Verifications?"
      class="mb-2 font-bold"
    />
    <div class="mb-8">
      Yes - we plan on continually extending support in TZP to also include
      credentials from additional public social profiles to give creators the
      ability to continue to associate their core public profiles.
    </div>

    <TextBody2
      value="What Wallets are Currently Supported?"
      class="mb-2 font-bold"
    />
    <div class="mb-8">
      At the moment we’ve integrated Beacon which supports popular Tezos wallets
      such as Kukai, Temple, and many others.
    </div>

    <TextBody2
      value="I Would Like to Report a Bug or Give Feedback"
      class="mb-2 font-bold"
    />
    <div class="mb-8">
      Please direct any questions or inquiries by joining our Discord
      <a href="https://discord.gg/WjvuYqvm5Y" target="_blank">here</a>.
    </div>
  </div>
</BasePage>
