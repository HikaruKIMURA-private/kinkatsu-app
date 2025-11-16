# データベース ER図

## Mermaid ER図

```mermaid
erDiagram
    User ||--o{ Session : "has"
    User ||--o{ Account : "has"
    User ||--o{ Passkey : "has"
    User ||--o{ Workout : "creates"
    
    Workout ||--o{ WorkoutItem : "contains"
    Exercise ||--o{ WorkoutItem : "used_in"
    WorkoutItem ||--o{ WorkoutSet : "has"
    
    User {
        string id PK
        string name
        string email UK
        boolean emailVerified
        string image
        datetime createdAt
        datetime updatedAt
    }
    
    Session {
        string id PK
        datetime expiresAt
        string token UK
        string ipAddress
        string userAgent
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Account {
        string id PK
        string accountId
        string providerId
        string userId FK
        string accessToken
        string refreshToken
        string idToken
        datetime expiresAt
        string password
        string scope
        datetime createdAt
        datetime updatedAt
    }
    
    Verification {
        string id PK
        string identifier
        string value
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
    }
    
    Passkey {
        string id PK
        string name
        text publicKey
        string userId FK
        string credentialID UK
        bigint counter
        string deviceType
        boolean backedUp
        string transports
        datetime createdAt
        datetime updatedAt
    }
    
    Exercise {
        string id PK
        string name
        enum bodyPart
        string createdBy
        datetime createdAt
    }
    
    Workout {
        string id PK
        string userId FK
        datetime date
        decimal bodyWeight
        decimal dayRpe
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    WorkoutItem {
        string id PK
        string workoutId FK
        string exerciseId FK
        int orderIndex
        datetime createdAt
    }
    
    WorkoutSet {
        string id PK
        string workoutItemId FK
        decimal weightKg
        int reps
        decimal rpe
        datetime createdAt
    }
```

## リレーションシップ説明

### better-auth 関連
- **User 1:N Session**: 1ユーザーは複数のセッションを持つ
- **User 1:N Account**: 1ユーザーは複数のアカウント（OAuth等）を持つ
- **User 1:N Passkey**: 1ユーザーは複数のPasskeyを持つ
- **Verification**: 独立テーブル（ユーザーとのリレーションなし）

### アプリケーション関連
- **User 1:N Workout**: 1ユーザーは複数のワークアウトを持つ
- **Workout 1:N WorkoutItem**: 1ワークアウトは複数の種目を持つ
- **Exercise 1:N WorkoutItem**: 1種目は複数のワークアウトで使用される
- **WorkoutItem 1:N WorkoutSet**: 1種目は複数のセットを持つ

## 制約

### ユニーク制約
- `User.email`: メールアドレスは一意
- `Session.token`: セッショントークンは一意
- `Account.providerId + accountId`: プロバイダーとアカウントIDの組み合わせは一意
- `Verification.identifier + value`: 識別子と値の組み合わせは一意
- `Passkey.credentialID`: 認証情報IDは一意
- `Exercise.name + bodyPart`: 種目名と部位の組み合わせは一意
- `Workout.userId + date`: 1ユーザーは1日1件のワークアウト

### 外部キー制約
- `Workout.userId` → `User.id` (CASCADE DELETE)
- `WorkoutItem.workoutId` → `Workout.id` (CASCADE DELETE)
- `WorkoutItem.exerciseId` → `Exercise.id`
- `WorkoutSet.workoutItemId` → `WorkoutItem.id` (CASCADE DELETE)
- `Session.userId` → `User.id` (CASCADE DELETE)
- `Account.userId` → `User.id` (CASCADE DELETE)
- `Passkey.userId` → `User.id` (CASCADE DELETE)

### 注意事項
- `Exercise.createdBy` は `User.id` を参照しますが、外部キー制約は設定されていません（柔軟性のため）

