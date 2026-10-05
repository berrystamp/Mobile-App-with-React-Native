# Printer review implementation

## Changes

- Repaired the cart's mismatched JSX, duplicate quantity controls, missing clear/selection handlers, and footer. Cart tabs now render their own items and totals. Opening print preferences continues into the printing flow.
- Account switching updates persistent storage before changing the active role. Account screens remount on role changes, orders honor their explicit profile header, and dashboard insights select the active profile rather than always preferring the designer.
- Conversation normalization uses the active profile ID, filters conversations belonging to another profile, and labels customers correctly. Chat uses the selected account role rather than inferring it from historical messages. Printing requests and their previews recognize printing order types.
- Dashboard wallet history opens the wallet with withdrawal and transaction details. Credit/debit classification is shared with the payments screen. The details eye control masks the selected amount; payments history respects its visibility toggle. Withdrawal confirmations display the returned status rather than assuming completion.
- Influencer Orders keeps its requested heading, has a back-navigation fallback, and uses a distinct `/influencer-merch-orders/order/[orderId]` detail route to avoid colliding with `[designId]`.
- Notification rows retain their detail popup. Push taps, including cold-start taps after authentication, open notification details. Seller dashboards have a notification icon. Android uses a transparent white notification icon and creates its notification channel before requesting permission.
- Printer My Account already includes My Shop, Orders, Wallet, and Update Shop Location. Edit Profile already provides address selection; it now applies a two-calendar-month interval per user and role and displays the next permitted date. Failed location requests no longer pretend to succeed.
- Password inputs now have a stable component identity, preventing keyboard dismissal on each keystroke. Email verification accepts the complete OTP instead of limiting entry to five digits, validates the new email, updates cached user data after verification, and surfaces API-declared failures.
- Bug report confirmation headings say Report a bug instead of Share an idea.

## Validation

- `node_modules\.bin\tsc.cmd --noEmit --pretty false`
- `node scripts/test-printer-review.cjs` — six tests covering profile isolation, conversations, wallet direction, calendar-month intervals, order metadata, and account/API synchronization.
- Android JavaScript/Hermes export succeeded using Expo export. This is a bundle check, not an installed-device test.
- The repository-wide ESLint check reports additional React hook/compiler issues in existing code. It is not a clean lint baseline.

## Backend and device validation still needed

1. Confirm `/user/change-email` and `/user/change-email/verify` request contracts against the backend and exercise a real OTP. No API specification is included here.
2. Implement or identify the server endpoint that registers Expo push tokens against the signed-in user/profile. The existing app only stores the token locally. Sending delivery notifications requires server integration, platform credentials, and a development or production build on a device. The notification icon change requires rebuilding the native app.
3. Enforce the two-month location interval on the server. The client uses returned `shopLocationUpdatedAt`/`locationUpdatedAt` when available, otherwise a device-local timestamp. Reinstalling or using a different device can bypass a client-only interval.
4. Verify backend authorization isolates designer and printer data even when they belong to the same user. Client filtering is not an authorization boundary.
5. Test printer → designer → printer switches, order previews, real withdrawals, back navigation, password typing, and notification taps on a device.

The pre-existing unmerged Git index entries were not staged or resolved by these edits.
