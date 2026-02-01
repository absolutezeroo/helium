# User Classification Architecture Documentation

This document categorizes all AS3 user classification files into **ENGINE** (business logic we need to implement) and **VIEW** (UI code we ignore since SolidJS handles our UI).

> **Rule**: AS3 source in `source_as/` is the source of truth. Follow it exactly.

---

## Summary

| Category          | Count | Description                              |
|-------------------|-------|------------------------------------------|
| ENGINE (Required) | 1     | User classification data model           |
| VIEW (Ignore)     | 0     | No UI components in this module          |

---

## ENGINE FILES (We Need These)

### Data Models

| AS3 File                    | Purpose                                      | TS Equivalent                 | Status |
|-----------------------------|----------------------------------------------|-------------------------------|--------|
| `UserClassificationData.as` | User classification data with type constants | `UserClassificationData.ts`   | TODO   |

---

## VIEW FILES (We Ignore These)

*No VIEW files exist in this module.*

---

## File Analysis

### UserClassificationData.as

**Location**: `source_as/habbo/userclassification/UserClassificationData.as`

**Purpose**: Data class that holds user classification information, including user ID, username, and classification type.

**Classification Constants** (static):
| Constant                     | Value | Description                    |
|------------------------------|-------|--------------------------------|
| `var_4996`                   | 1     | Classification type 1 (unknown)|
| `var_4994`                   | 2     | Classification type 2 (unknown)|
| `var_4983`                   | 3     | Classification type 3 (unknown)|
| `PAYING_USER_CLASSIFICATION` | 4     | Paying user classification     |

**Properties**:
| Property    | Type   | Description              |
|-------------|--------|--------------------------|
| `var_418`   | int    | User ID                  |
| `_username` | String | Username                 |
| `var_4037`  | String | Classification type name |

**Public Getters**:
- `userId`: Returns the user's ID
- `username`: Returns the username
- `classType`: Returns the classification type string

**Methods**:
- `toString()`: Returns a string representation of the user classification data

---

## Architecture Pattern

### AS3 Architecture
```
UserClassificationData (Data Model)
    ├── Static classification type constants (1-4)
    ├── User identification (ID, username)
    └── Classification type string
```

### Our TypeScript Architecture
```typescript
// UserClassificationData.ts
export enum UserClassificationType {
    TYPE_1 = 1,      // var_4996 - needs deobfuscation
    TYPE_2 = 2,      // var_4994 - needs deobfuscation
    TYPE_3 = 3,      // var_4983 - needs deobfuscation
    PAYING_USER = 4  // PAYING_USER_CLASSIFICATION
}

export class UserClassificationData {
    constructor(
        public readonly userId: number,
        public readonly username: string,
        public readonly classType: string
    ) {}

    toString(): string {
        return `[${this.userId}, ${this.username}] [${this.classType}]`;
    }
}
```

---

## Notes

1. **Obfuscated Variable Names**: The AS3 source contains obfuscated variable names (`var_4996`, `var_4994`, `var_4983`). Only `PAYING_USER_CLASSIFICATION` has a descriptive name. The actual meanings of types 1-3 may need to be determined from usage context elsewhere in the codebase.

2. **Simple Module**: This is a minimal module containing only a single data class with no UI components.

3. **Usage Context**: This data structure is likely used by the server to communicate user payment/subscription status for features that behave differently based on user type (e.g., HC/VIP users vs free users).

---

## Next Implementation Steps

1. **Create TypeScript equivalent** - Implement `UserClassificationData.ts`
2. **Identify constant meanings** - Search codebase for usage of classification constants to determine actual meanings of types 1-3
3. **Find message handlers** - Identify which incoming messages populate this data structure
