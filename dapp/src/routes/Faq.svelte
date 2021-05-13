<script lang="ts">
  import { BasePage, TextBody2 } from 'components';
</script>

<BasePage class="flex-col md:mx-auto lg:mx-12 xl:mx-auto">
  <h2 class="mb-4 text-5xl font-bold text-center">FAQ</h2>
  <div class="flex flex-col justify-center flex-grow">
    <TextBody2 value="What is Tezos Profiles?" class="mb-2 font-bold" />
    <TextBody2
      value="Tezos Profiles (TZP) is a web application where users can associate their public online identity based on social media profiles and self-attested information to their Tezos address."
      class="mb-4"
    />
    <TextBody2
      value="How Does it Work?"
      class="mb-2 font-bold"
    />
    <TextBody2
      value="Users can build their profiles with the available credentials on Tezos Profiles. Each credential has a unique workflow that must be completed prior to credential issuance. Once issued and uploaded, platforms can then globally resolve this user-managed information to establish a creator’s profile."
      class="mb-4"
    />
    <TextBody2
      value="Do You Plan on Supporting Additional Verifications?"
      class="mb-2 font-bold"
    />
    <TextBody2
      value="Yes - we plan on continually extending support in TZP to also include credentials from additional public social profiles to give creators the ability to continue to associate their core public profiles."
      class="mb-4"
    />
    <TextBody2
      value="What Wallets are Currently Supported?"
      class="mb-2 font-bold"
    />
    <TextBody2
      value="At the moment we’ve integrated Beacon which supports popular Tezos wallets such as Kukai, Temple, and many others."
      class="mb-4"
    />
    <TextBody2
      value="I Would Like to Report a Bug or Give Feedback"
      class="mb-2 font-bold"
    />
    <TextBody2
      value="Please direct any questions or inquiries to hello@spruceid.com, or the #identity channel in the Tezos Developer slack."
      class="mb-4"
    />
  </div>
</BasePage>
