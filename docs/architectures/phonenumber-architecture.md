# Phone Number Architecture Documentation

This document categorizes all AS3 phonenumber files into **ENGINE** (business logic we need to implement) and **VIEW** (UI code we ignore since SolidJS handles our UI).

> **Rule**: AS3 source in `source_as/` is the source of truth. Follow it exactly.

---

## Summary

| Category          | Count | Description                                      |
|-------------------|-------|--------------------------------------------------|
| ENGINE (Required) | 3     | Phone verification logic, state constants        |
| VIEW (Ignore)     | 4     | UI components for phone input and verification   |

---

## ENGINE FILES (We Need These)

### Core Component

| AS3 File               | Purpose                                          | TS Equivalent          | Status |
|------------------------|--------------------------------------------------|------------------------|--------|
| `HabboPhoneNumber.as`  | Main component - phone verification orchestrator | `HabboPhoneNumber.ts`  | TODO   |

**Key Responsibilities:**
- Initializes phone verification system when `sms.identity.verification.enabled` is true
- Registers message event handlers for phone verification flow
- Manages verification state and retry timers
- Sends phone number and verification code to server
- Handles "never again" opt-out preference
- Coordinates between collect and verify states

**Message Handlers:**
- `PhoneCollectionStateMessageEvent` - Receives current phone/verification status
- `TryPhoneNumberResultMessageEvent` - Receives result after submitting phone number
- `TryVerificationCodeResultMessageEvent` - Receives result after submitting verification code

**Outgoing Messages:**
- `TryPhoneNumberMessageComposer(countryCode, phoneNumber)` - Submit phone number
- `VerifyCodeMessageComposer(code)` - Submit verification code (uppercase)
- `SetPhoneNumberVerificationStatusMessageComposer(status)` - Set "never again" status
- `ResetPhoneNumberStateMessageComposer()` - Reset phone collection state

### State Constants

| AS3 File        | Purpose                                 | TS Equivalent               | Status |
|-----------------|-----------------------------------------|-----------------------------|--------|
| `class_3552.as` | Phone collection status enum constants  | `PhoneCollectionStatus.ts`  | TODO   |
| `class_3585.as` | Phone verification result enum constants| `PhoneVerificationResult.ts`| TODO   |

**class_3552 - Collection Status Constants:**
```typescript
enum PhoneCollectionStatus {
    NON_EXISTING = 0,    // No phone number exists
    PENDING = 1,         // const_474 - Phone number pending
    NEVER_AGAIN = 2,     // User opted out permanently
    TOKEN_INPUT = 3      // Awaiting verification token input
}
```

**class_3585 - Verification Result Constants:**
```typescript
enum PhoneVerificationResult {
    NON_EXISTING = 0,           // No record
    TOKEN_SENT = 1,             // Verification token sent
    VERIFIED = 2,               // Phone verified successfully
    OK = 3,                     // Operation successful
    ERROR = 4,                  // General error
    RATE_LIMIT = 5,             // Too many attempts
    NUMBER_MISTYPED = 6,        // Invalid phone number format
    TOKEN_MISMATCH = 7,         // Wrong verification code
    NOT_FOUND = 8,              // Record not found
    NON_VERIFIED = 9,           // Phone not yet verified
    NUMBER_ALREADY_VERIFIED = 10 // Phone already verified by another user
}
```

---

## VIEW FILES (We Ignore These)

SolidJS handles our UI. These are only for reference if UI behavior is unclear.

### Phone Number Collection Views

| AS3 File                             | Purpose                            | Notes                              |
|--------------------------------------|------------------------------------|------------------------------------|
| `PhoneNumberCollectView.as`          | Main phone number input dialog     | Full window with country selector  |
| `PhoneNumberCollectMinimizedView.as` | Minimized/collapsed collect view   | Toolbar extension button           |

**PhoneNumberCollectView UI Elements:**
- Country dropdown selector with all country codes
- Phone number text input (max 30 chars)
- OK button (disabled until input)
- "Skip" link - minimizes view
- "Never again" link - opts out permanently
- Preferred countries shown at top of dropdown

### Verification Code Input Views

| AS3 File                              | Purpose                          | Notes                           |
|---------------------------------------|----------------------------------|---------------------------------|
| `VerificationCodeInputView.as`        | Main verification code input     | Full window with retry timer    |
| `VerificationCodeInputMinimizedView.as` | Minimized/collapsed verify view | Toolbar extension button        |

**VerificationCodeInputView UI Elements:**
- Verification code text input (max 10 chars)
- OK button (disabled until input)
- "Did not receive code" link - resets to phone input (with rate limit timer)
- Wait timer label showing seconds until retry allowed

---

## Architecture Pattern

### AS3 Architecture
```
HabboPhoneNumber (Component)
    ├── PhoneCollectionStateMessageEvent handler
    ├── TryPhoneNumberResultMessageEvent handler
    ├── TryVerificationCodeResultMessageEvent handler
    ├── PhoneNumberCollectView (VIEW)
    ├── PhoneNumberCollectMinimizedView (VIEW)
    ├── VerificationCodeInputView (VIEW)
    └── VerificationCodeInputMinimizedView (VIEW)
```

### Our TypeScript Architecture
```
HabboPhoneNumber (injectable singleton)
    ├── Message handlers (same as AS3)
    ├── State management (emits events)
    └── Retry timer logic

phoneNumberStore (SolidJS reactive store)
    └── Listens to HabboPhoneNumber events
    └── Exposes reactive signals to UI components
```

---

## State Machine Flow

### Phone Collection State Machine
```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌───────────────────────────────┐                         │
│   NON_EXISTING / NON_VERIFIED │◄────────────────────────┤
│   (Show PhoneNumberCollectView)│                        │
└───────────────┬───────────────┘                         │
                │                                         │
                │ User submits phone number               │
                │ sendTryPhoneNumber(country, number)     │
                ▼                                         │
┌───────────────────────────────┐                         │
│      TOKEN_SENT / OK          │                         │
│ (Show VerificationCodeInputView)                        │
└───────────────┬───────────────┘                         │
                │                                         │
                ├─── Token valid ──► VERIFIED (done)      │
                │                                         │
                ├─── Token mismatch ─► Show error, retry  │
                │                                         │
                └─── "Did not receive" ───────────────────┘
                     requestPhoneNumberCollectionReset()
```

### Error Handling
- Result codes 4, 5, 6, 10 show alert and return to collect view
- Result code 7 (TOKEN_MISMATCH) shows error in verify view
- Rate limiting enforced via `_retryEnableTime` and `millisecondsToAllowProcessReset`

---

## Communication Messages

### Outgoing

| Composer                                    | Purpose                          | Parameters                    |
|---------------------------------------------|----------------------------------|-------------------------------|
| `TryPhoneNumberMessageComposer`             | Submit phone number for SMS      | countryCode: String, phone: String |
| `VerifyCodeMessageComposer`                 | Submit verification code         | code: String (auto-uppercased) |
| `SetPhoneNumberVerificationStatusMessageComposer` | Set "never again" preference | status: int (2 = NEVER_AGAIN) |
| `ResetPhoneNumberStateMessageComposer`      | Reset to phone input state       | (none)                        |

### Incoming

| Event                              | Purpose                          | Key Parser Fields                     |
|------------------------------------|----------------------------------|---------------------------------------|
| `PhoneCollectionStateMessageEvent` | Current phone/verification state | collectionStatusCode, phoneStatusCode, millisecondsToAllowProcessReset |
| `TryPhoneNumberResultMessageEvent` | Result of phone submission       | resultCode, millisToAllowProcessReset |
| `TryVerificationCodeResultMessageEvent` | Result of code verification | resultCode, millisecondsToAllowProcessReset |

---

## Configuration

| Property                           | Purpose                              |
|------------------------------------|--------------------------------------|
| `sms.identity.verification.enabled`| Enable/disable phone verification    |
| `phone.number.preferred.countries` | Comma-separated preferred country codes |
| `phone.collection.status`          | Runtime: current collection status   |
| `phone.verification.status`        | Runtime: current verification status |

---

## Country Code Support

The system supports 242 country codes (ISO 3166-1 alpha-2), with preferred countries configurable via `phone.number.preferred.countries`. Country names are loaded from localization key `phone.number.collect.countries` as JSON.

---

## Next Implementation Steps

1. **Create PhoneCollectionStatus enum** - From class_3552 constants
2. **Create PhoneVerificationResult enum** - From class_3585 constants
3. **Implement HabboPhoneNumber** - Main component with message handlers
4. **Create phoneNumberStore** - SolidJS store for UI state
5. **Handle retry timing** - Implement rate limit countdown logic
