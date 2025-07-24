# Schröd
## 概要

Schrödは、フォルダ構造と最小限の指示で、AIが自動的にアプリケーション全体を設計・実装するVS Code拡張機能です。階層的な設計分解を通じて、複雑なアプリケーションを体系的に構築し、CLI・拡張機能の両方から操作可能です。

## 1. 基本概念

### 1.1 核となる思想

**「量子的実行ノード」** - フォルダが実行体として機能

- フォルダ名に `@Schröd` サフィックスを付けることで「実行可能ノード」として認識
- クリック：実行体として動作
- ダブルクリック：通常フォルダとして展開
- 階層構造が設計アーキテクチャを直接表現

### 1.2 基本用語

|名称|定義|例|
|---|---|---|
|**Schrödノード**|`@Schröd` サフィックス付きフォルダ|`login@Schröd.ui/`|
|**実行パス**|Schrödノードの完全パス|`Schröd.ui/login@Schröd.ui/form@Schröd.ticket`|
|**レベル**|階層の深さ（1-4の固定レベル）|レベル1: アプリ全体、レベル4: 実装単位|
|**ドメイン**|UI/Logic/Test の分離|`@Schröd.ui`, `@Schröd.logic`, `@Schröd.test`|
|**チケット**|実装可能な最小単位|`header@Schröd.ticket`|

### 1.3 厳格な階層構造

```
レベル1: app@Schröd                    # アプリ全体の仕様
    ↓
レベル2: Schröd.{ui|logic|test}       # ドメイン分離
    ↓
レベル3: 機能名@Schröd.{ui|logic|test} # 機能別設計
    ↓
レベル4: 実装名@Schröd.ticket         # 実装単位
```

**✅ 正しい構造例：**

```
blog-app@Schröd/
├── Schröd.ui/
│   ├── auth@Schröd.ui/
│   │   ├── login-form@Schröd.ticket/
│   │   └── signup-form@Schröd.ticket/
│   └── dashboard@Schröd.ui/
│       └── main-panel@Schröd.ticket/
└── Schröd.logic/
    └── auth@Schröd.logic/
        └── jwt-handler@Schröd.ticket/
```

**❌ 間違った構造例：**

```
❌ app@Schröd → login@Schröd.ui        # レベル2をスキップ
❌ login.ui@Schröd                     # 命名規則違反
❌ Schröd.ui → form@Schröd.ticket      # レベル3をスキップ
```

## 2. ファイル・フォルダ構造

### 2.1 プロジェクト構造

```
project-root/
├── .schrod/                          # Schröd設定ディレクトリ
│   ├── config.json                   # プロジェクト設定
│   ├── app@Schröd/                   # レベル1: アプリ仕様
│   │   ├── idea.md                   # アプリの基本仕様
│   │   └── requirements.md           # 詳細要件
│   ├── Schröd.ui/                    # レベル2: UI全体
│   │   ├── architecture.md           # UI全体アーキテクチャ
│   │   ├── auth@Schröd.ui/           # レベル3: 認証UI
│   │   │   ├── design.md             # UI設計仕様
│   │   │   ├── login@Schröd.ticket/  # レベル4: ログイン実装
│   │   │   │   ├── spec.md           # 実装仕様
│   │   │   │   ├── impl/             # 実装ファイル
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── login.css
│   │   │   │   └── status.json       # 実装状態
│   │   │   └── register@Schröd.ticket/
│   │   └── dashboard@Schröd.ui/
│   ├── Schröd.logic/                 # レベル2: ロジック全体
│   │   ├── architecture.md           
│   │   ├── auth@Schröd.logic/        # レベル3: 認証ロジック
│   │   │   ├── spec.md
│   │   │   ├── jwt@Schröd.ticket/    # JWT処理
│   │   │   └── session@Schröd.ticket/ # セッション管理
│   │   └── api@Schröd.logic/
│   └── Schröd.test/                  # レベル2: テスト全体
│       └── auth@Schröd.test/         # レベル3: 認証テスト
│           └── integration@Schröd.ticket/
├── src/                              # 生成される実装ファイル
├── package.json
└── README.md
```

### 2.2 必須ファイル

#### `.schrod/config.json`

```json
{
  "version": "1.0.0",
  "projectName": "my-app",
  "defaultAI": "claude-sonnet-4",
  "aiOverrides": {
    "**/*@Schröd.ui/**": "claude-haiku",
    "**/*@Schröd.logic/**": "claude-sonnet-4",
    "**/test*": "gpt-4"
  },
  "outputDir": "src",
  "created": "2025-07-23T12:00:00Z",
  "lastModified": "2025-07-23T12:00:00Z"
}
```

#### チケットの `status.json`

```json
{
  "status": "pending" | "running" | "completed" | "failed",
  "lastRun": "2025-07-23T12:00:00Z",
  "aiUsed": "claude-sonnet-4",
  "executionTime": 45.2,
  "dependencies": ["auth@Schröd.logic/jwt@Schröd.ticket"],
  "outputs": ["src/components/LoginForm.tsx", "src/styles/login.css"],
  "checkpoints": ["initial-setup", "component-created", "styling-applied"]
}
```

## 3. VS Code拡張機能

### 3.1 UI要素

#### エクスプローラー統合

- **Schrödビュー**: 専用サイドバーでSchröd構造を表示
- **フォルダアイコン**: レベル別・状態別のアイコン表示
- **色分け**: ステータスに応じた色分け（pending/running/completed/failed）
- **バッジ**: レベル表示バッジ（🎯 App, 🏗️ Architecture, 📦 Feature, 🎫 Ticket）

#### インタラクション

- **右クリックメニュー**:
    - `Schröd: Plan` - 実行計画の表示
    - `Schröd: Run` - 実行
    - `Schröd: Status` - 状態確認
    - `Schröd: View Dependencies` - 依存関係表示

#### ステータス表示

```
Schröd Project: my-blog-app                    [Running 3/12]

Schröd.ui/
├─ auth@Schröd.ui/
│  ├─ ✓ login@Schröd.ticket                   [Completed]
│  ├─ ● register@Schröd.ticket                [Running 67%]
│  └─ ○ profile@Schröd.ticket                 [Pending]
├─ ○ blog@Schröd.ui/                          [Not Started]
└─ ○ layout@Schröd.ui/                        [Not Started]

Schröd.logic/
├─ ✓ auth@Schröd.logic/                       [Completed]
└─ ○ api@Schröd.logic/                        [Pending]
```

### 3.2 コマンドパレット

#### 基本コマンド

- `Schröd: Initialize Project` - プロジェクト初期化
- `Schröd: Create App Spec` - アプリ仕様作成
- `Schröd: Decompose to UI/Logic` - UI/Logic分解
- `Schröd: Add Feature` - 機能追加
- `Schröd: Create Tickets` - チケット分解
- `Schröd: Run All Tickets` - 全チケット実行
- `Schröd: Show Dependency Graph` - 依存関係グラフ表示

#### 実行コマンド

- `Schröd: Run with AI Selection` - AI選択実行
- `Schröd: Run Specific Path` - 特定パス実行
- `Schröd: Resume Failed` - 失敗したタスクの再実行
- `Schröd: Clean and Restart` - クリーンアップして再開

### 3.3 WebView パネル

#### 依存関係グラフ

```html
<!-- 依存関係の可視化 -->
<div class="dependency-graph">
  <svg viewBox="0 0 800 600">
    <!-- ノードとエッジをSVGで描画 -->
  </svg>
</div>
```

#### 実行プログレス

```html
<!-- リアルタイム進捗表示 -->
<div class="execution-progress">
  <div class="progress-bar">
    <div class="progress-fill" style="width: 67%"></div>
  </div>
  <div class="current-task">
    Running: login@Schröd.ticket (Step 3/5)
  </div>
</div>
```

## 4. CLI インターフェース

### 4.1 基本コマンド

#### プロジェクト管理

```bash
# プロジェクト初期化
schrod init <project-name>
schrod init my-blog-app

# 設定確認
schrod config
schrod config --list-ais

# 状態確認
schrod status
schrod status --tree
schrod status --failed-only
```

#### 開発フロー

```bash
# アプリ仕様作成
schrod spec "ブログアプリを作りたい。認証機能付き"

# UI/Logic分解
schrod decompose

# 機能追加
schrod add-feature "auth" --domain ui
schrod add-feature "blog" --domain logic

# チケット分解
schrod create-tickets "auth@Schröd.ui"

# 実行
schrod run "login@Schröd.ticket"
schrod run "**/*@Schröd.ticket"
schrod run --ai claude-sonnet-4 "auth@Schröd.ui/**"
```

#### 高度な操作

```bash
# 依存関係分析
schrod deps
schrod deps --graph
schrod deps --check-cycles

# 部分的な再実行
schrod resume "login@Schröd.ticket"
schrod clean "auth@Schröd.ui/**"

# AI選択実行
schrod run --ai gpt-4 "complex-algorithm@Schröd.ticket"
schrod run --ai-pattern "**/ui/**=claude-haiku,**/logic/**=claude-sonnet-4"
```

### 4.2 出力例

#### ステータス出力

```
$ schrod status --tree

📊 Schröd Project Status: my-blog-app

🎯 blog-app@Schröd                              [Completed]
├─ 🏗️ Schröd.ui                                [In Progress 60%]
│  ├─ 📦 auth@Schröd.ui                        [Completed]
│  │  ├─ 🎫 login@Schröd.ticket               ✓ [Completed]
│  │  ├─ 🎫 register@Schröd.ticket            ● [Running]
│  │  └─ 🎫 profile@Schröd.ticket             ○ [Pending]
│  ├─ 📦 blog@Schröd.ui                        ○ [Pending]
│  └─ 📦 layout@Schröd.ui                      ○ [Pending]
└─ 🏗️ Schröd.logic                             [Completed]
   ├─ 📦 auth@Schröd.logic                     ✓ [Completed]
   │  ├─ 🎫 jwt@Schröd.ticket                 ✓ [Completed]
   │  └─ 🎫 session@Schröd.ticket             ✓ [Completed]
   └─ 📦 api@Schröd.logic                      ○ [Pending]

📈 Progress: 7/15 tasks completed (47%)
⏱️  Estimated remaining: 23 minutes
🤖 Current AI: claude-sonnet-4
```

#### 実行出力

```
$ schrod run "register@Schröd.ticket"

🚀 Starting Schröd execution...

📋 Execution Plan:
  1. register@Schröd.ticket
     Dependencies: auth@Schröd.logic/jwt@Schröd.ticket ✓
     AI: claude-sonnet-4
     Estimated time: 3-5 minutes

🤖 [claude-sonnet-4] Analyzing register@Schröd.ticket...
📝 Generating registration form component...
🎨 Applying Tailwind CSS styling...
🔗 Connecting to auth logic...
🧪 Creating unit tests...

✅ Completed: register@Schröd.ticket (4m 32s)

📁 Generated files:
  - src/components/auth/RegisterForm.tsx
  - src/components/auth/RegisterForm.test.tsx
  - src/styles/register.css

🎉 Execution completed successfully!
```

## 5. AI統合システム

### 5.1 AI選択ロジック

#### デフォルト設定

```json
{
  "defaultAI": "claude-sonnet-4",
  "aiOverrides": {
    "**/ui/**": "claude-haiku",        // UI系は軽量モデル
    "**/logic/**": "claude-sonnet-4",  // ロジック系は標準モデル
    "**/test/**": "gpt-4",             // テスト系は高精度モデル
    "**/*-algorithm*": "claude-opus",  // アルゴリズム系は最高性能
    "**/*-design*": "midjourney-api"   // デザイン系は専用モデル
  }
}
```

#### 動的AI選択

```typescript
interface AISelection {
  selectAI(path: string, taskType: TaskType): string;
  getCapabilities(aiName: string): AICapabilities;
  estimateTime(aiName: string, taskComplexity: number): number;
  estimateCost(aiName: string, tokenCount: number): number;
}
```

### 5.2 プロンプト生成

#### コンテキスト構築

```
System: あなたはSchrödフレームワークの実行エンジンです。

Task: ${path} を実装してください。

Context:
- Level: ${level} (1=App, 2=Architecture, 3=Feature, 4=Ticket)
- Domain: ${domain} (ui/logic/test)
- Dependencies: ${dependencies.join(', ')}
- Parent: ${parent}
- Existing files: ${existingFiles.join(', ')}

Specification:
${specContent}

Requirements:
- 型安全なTypeScriptコード
- 適切なエラーハンドリング
- ユニットテスト（テストドメインでない場合）
- ドキュメント文字列
- アクセシビリティ対応（UI系の場合）

Output format:
1. 実装の説明
2. ファイル構造
3. 実装コード
4. テストコード（該当する場合）
```

### 5.3 品質制御

#### 実装検証

```typescript
interface QualityCheck {
  validateTypeScript(code: string): ValidationResult;
  checkAccessibility(uiCode: string): AccessibilityReport;
  performSecurityScan(code: string): SecurityReport;
  measureComplexity(code: string): ComplexityMetrics;
}
```

## 6. 依存関係管理

### 6.1 依存関係グラフ

#### 自動検出

```typescript
interface DependencyAnalyzer {
  analyzeImports(filePath: string): string[];
  analyzeSchrodDependencies(schrodPath: string): string[];
  detectCircularDependencies(): CircularDependency[];
  generateExecutionOrder(): string[];
}
```

#### 実行順序最適化

```
実行可能な並列グループを生成:

Group 1 (並列実行可能):
- Schröd.logic/auth@Schröd.logic/jwt@Schröd.ticket
- Schröd.logic/api@Schröd.logic/middleware@Schröd.ticket

Group 2 (Group 1完了後):
- Schröd.logic/auth@Schröd.logic/session@Schröd.ticket
- Schröd.ui/layout@Schröd.ui/header@Schröd.ticket

Group 3 (Group 2完了後):
- Schröd.ui/auth@Schröd.ui/login@Schröd.ticket
```

## 7. エラーハンドリング・リカバリ

### 7.1 チェックポイントシステム

#### 自動保存

```json
{
  "checkpoints": {
    "login@Schröd.ticket": {
      "step1": "spec-analysis-completed",
      "step2": "component-structure-created", 
      "step3": "basic-implementation-done",
      "current": "step3",
      "canResumeFrom": ["step2", "step3"]
    }
  }
}
```

#### リカバリ操作

```bash
# 失敗したタスクの確認
schrod failed

# 特定のチェックポイントから再開
schrod resume "login@Schröd.ticket" --from step2

# 部分的な修正
schrod fix "login@Schröd.ticket" --issue "TypeScript型エラー"
```

### 7.2 エラー分類・対処

#### エラー種別

```typescript
enum ErrorType {
  AI_TIMEOUT = "ai_timeout",
  DEPENDENCY_MISSING = "dependency_missing", 
  SYNTAX_ERROR = "syntax_error",
  TYPE_ERROR = "type_error",
  CIRCULAR_DEPENDENCY = "circular_dependency",
  RESOURCE_EXHAUSTED = "resource_exhausted"
}

interface ErrorHandler {
  categorizeError(error: string): ErrorType;
  suggestFix(errorType: ErrorType, context: string): string[];
  autoFix(errorType: ErrorType, filePath: string): boolean;
}
```

## 8. 設定・カスタマイズ

### 8.1 プロジェクト設定

#### VS Code設定

```json
{
  "schrod.defaultAI": "claude-sonnet-4",
  "schrod.autoRun": false,
  "schrod.showProgressNotifications": true,
  "schrod.parallelExecutions": 3,
  "schrod.outputDirectory": "src",
  "schrod.aiOverrides": {
    "**/ui/**": "claude-haiku",
    "**/logic/**": "claude-sonnet-4"
  }
}
```

#### CLI設定

```bash
# グローバル設定
schrod config set default-ai claude-sonnet-4
schrod config set parallel-limit 5

# プロジェクト固有設定
schrod config set --local output-dir dist
schrod config set --local ai-override "**/*test*=gpt-4"
```

### 8.2 拡張性

#### カスタムAI統合

```typescript
interface CustomAIProvider {
  name: string;
  endpoint: string;
  apiKey: string;
  capabilities: string[];
  rateLimits: RateLimit;
}
```

#### プラグインシステム

```typescript
interface SchrödPlugin {
  name: string;
  version: string;
  hooks: {
    beforeExecution?: (context: ExecutionContext) => void;
    afterExecution?: (result: ExecutionResult) => void;
    onError?: (error: Error, context: ExecutionContext) => void;
  };
}
```

## 9. パフォーマンス・監視

### 9.1 メトリクス収集

#### 実行統計

```json
{
  "metrics": {
    "totalExecutions": 127,
    "successRate": 94.5,
    "averageExecutionTime": 142.3,
    "aiUsageStats": {
      "claude-sonnet-4": {"count": 89, "successRate": 96.6},
      "claude-haiku": {"count": 23, "successRate": 87.0},
      "gpt-4": {"count": 15, "successRate": 100.0}
    },
    "commonErrors": [
      {"type": "type_error", "count": 5},
      {"type": "dependency_missing", "count": 2}
    ]
  }
}
```

### 9.2 最適化機能

#### 自動最適化

```typescript
interface PerformanceOptimizer {
  analyzeBottlenecks(): BottleneckReport;
  suggestAIReassignment(): AIReassignmentPlan;
  optimizeExecutionOrder(): string[];
  adjustParallelism(): number;
}
```

## 10. 開発ワークフロー例

### 10.1 新規プロジェクト作成

```bash
# 1. プロジェクト初期化
mkdir my-ecommerce && cd my-ecommerce
code .  # VS Codeで開く

# 2. VS Code拡張でSchröd初期化
# コマンドパレット: "Schröd: Initialize Project"

# 3. アプリ仕様作成
# VS CodeのSchrödビューで "Create App Spec" クリック
# または CLI: schrod spec "ECサイトを作りたい"

# 4. UI/Logic分解
# VS Codeで "Decompose to UI/Logic" 実行

# 5. 機能追加（段階的）
# auth機能追加
# product catalog機能追加  
# shopping cart機能追加

# 6. チケット分解・実行
# VS Codeで各機能を右クリック → "Create Tickets"
# その後、各チケットを右クリック → "Run"
```

### 10.2 既存プロジェクトへの統合

```bash
# 1. 既存プロジェクトにSchröd追加
cd existing-project
schrod init --existing

# 2. 既存コードの解析・Schröd化
schrod analyze --convert-to-schrod

# 3. 新機能をSchröd形式で追加
schrod add-feature "payment" --domain logic
```

## 11. 配布・インストール

### 11.1 VS Code拡張

#### Marketplace配布

- **拡張機能名**: "Schröd Framework"
- **カテゴリ**: Development Tools, AI
- **キーワード**: ai, development, automation, typescript, framework

#### インストール

```bash
# VS Code Extensions検索: "Schröd"
# または
code --install-extension schrod-team.schrod-framework
```

### 11.2 CLI配布

#### npm配布

```bash
# インストール
npm install -g schrod-cli

# 使用開始
schrod --version
schrod init my-project
```

#### Homebrew配布（将来）

```bash
brew install schrod
```
