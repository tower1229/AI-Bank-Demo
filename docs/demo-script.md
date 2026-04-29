# 中文演示脚本

## 演示素材清单

所有身份资料图都必须是 AI 生成的虚构样张，不使用真实个人信息，不复刻真实国家证件版式，不放真实国徽、签名、条码、二维码或可机读 MRZ。

为了兼顾演示真实感和安全边界，素材统一生成为银行内部 KYC 演示资料卡，而不是政府签发证件。图片不需要水印，但页面标题必须明确是：

```text
Core Bank System - KYC Demo Customer Identity Sheet
```

这样视觉上像真实银行内部开户资料，OpenClaw 也能读取字段，但不会被误认为真实护照或身份证。

### 必备证件图

1. `chen-ming-kyc-demo.png`
   - 用途：AI 开户主流程。
   - 类型：银行内部 KYC 演示资料卡。
   - 字段生成要求：模型自行生成虚构成年人身份资料；建议客户名为 Chen Ming，以便匹配主流程话术。
   - 画面要求：字段清晰、英文标签清楚、像银行内部资料卡，不像官方证件。

2. `alice-wong-kyc-demo.png`
   - 用途：后台人工开户流程。
   - 类型：银行内部 KYC 演示资料卡。
   - 字段生成要求：模型自行生成虚构成年人身份资料；建议客户名为 Alice Wong，以便匹配后台人工开户话术。
   - 画面要求：用于后台上传/预览，字段可人工录入。

3. `minor-client-kyc-demo.png`
   - 用途：未成年开户阻断场景。
   - 类型：银行内部 KYC 演示资料卡。
   - 字段生成要求：模型自行生成虚构未成年人身份资料；建议客户名为 Kevin Lin，以便匹配阻断场景话术。
   - 画面要求：出生日期必须明显未满 18 岁。

### 可选证件图

4. `pep-client-kyc-demo.png`
   - 用途：增强审查提示场景。
   - 类型：银行内部 KYC 演示资料卡。
   - 字段生成要求：模型自行生成虚构成年人身份资料；建议客户名为 Olivia Tan，以便匹配 PEP 场景话术。
   - 配合话术：用户补充“PEP: Yes”，系统应标记 enhanced review 但仍允许提交申请。

### 证件图生成提示词模板

生成每张身份资料图时使用同一类提示词。除非演示脚本需要固定客户名，否则让模型自行生成虚构字段：

```text
Create one realistic enterprise private-banking KYC customer identity sheet for a software demo. It should look like a polished internal bank onboarding document, not a government-issued ID. Use a clean premium fintech layout, off-white document background, subtle gray borders, small Core Bank System logo text, structured field rows, and a neutral placeholder portrait silhouette. Do not include any real country emblem, official seal, barcode, QR code, MRZ, signature, hologram, stamp, or realistic government security pattern. Do not add a watermark.

The document title must be exactly: "Core Bank System - KYC Demo Customer Identity Sheet".

Randomly generate fictional but plausible values for all identity fields. Do not use real people. Use English field labels and make every value readable. Include exactly these fields:
- Name
- Referenced Document Type
- Referenced Document No
- Date of Birth
- Nationality
- Expiry Date

Constraints:
- Referenced Document Type should usually be Passport.
- Referenced Document No should be fictional, 8-10 uppercase letters/digits.
- Date of Birth should match the scenario: adult client for normal onboarding, under 18 for the minor-blocking scenario.
- Expiry Date should be in the future.
- The image should be sharp, front-facing, well lit, realistic as an internal banking form, and easy for OCR or a vision model to read.
```

如果需要和脚本话术完全匹配，可以在提示词末尾追加：

```text
Use this fictional customer name: <SCRIPT_CUSTOMER_NAME>. Randomly generate the other fields.
```

### 其他演示资料

- Telegram Bot 已接入 `ai-bank` agent。
- 本地或部署后的 `Core Bank System` Web Console。
- Seed 客户：
  - Zhang San：1,000,000 USD，medium risk。
  - Li Si：300,000 USD，medium risk。
  - Wang Wu：2,000,000 USD，high risk。
- Seed 产品：
  - USD Cash Plus。
  - Global Balanced Portfolio。
  - Private Equity Growth Fund。

## 演示前准备

打开：

- `Core Bank System` 后台控制台。
- AI Bank Demo Telegram Bot 的私聊窗口。
- 面向技术观众时，可打开 OpenClaw 日志窗口。

确认 seed 数据存在：

- Zhang San 有 USD 私人银行账户，余额 1,000,000 USD。
- Li Si 有 USD 私人银行账户，余额 300,000 USD。
- Wang Wu 有 USD 私人银行账户，余额 2,000,000 USD。
- 产品列表中可以看到 USD Cash Plus、Global Balanced Portfolio、Private Equity Growth Fund。

## 第一段：展示现有银行后台

讲解口径：

银行已经有一套内部核心系统。员工可以在后台手工创建开户申请、批准开户、转账和购买理财。AI 不是替代核心系统，而是在现有系统之上提高操作效率，减少人工录入和跨系统操作。

演示步骤：

1. 打开 Dashboard。
2. 展示客户、账户、产品、交易和审计日志。
3. 在后台手工创建一笔开户申请，客户使用 `Alice Wong`。
4. 上传或展示 `alice-wong-kyc-demo.png`，手工录入证件字段。
5. 补充业务字段：
   - Residential Address: 18 Marina View, Singapore
   - Occupation/Title: Family office director
   - Initial Deposit: 800,000 USD
   - Source of Funds: Investment income and company dividends
   - PEP: No
6. 提交前展示确认弹窗。
7. 提交后在申请详情页批准开户。
8. 展示系统创建了客户、账户、首笔入金交易和审计记录。

## 第二段：AI 辅助开户

Telegram 输入：

```text
帮客户 Chen Ming 开一个私人银行账户，首笔入金 750,000 美元，资金来自公司分红。
```

预期 AI 行为：

- 不直接提交申请。
- 要求上传护照或身份证件图片。
- 只追问缺少的少量业务字段：
  - 居住地址。
  - 职业/职位。
  - 是否 PEP。

补充信息：

```text
居住地址是 1 Demo Road, Hong Kong。他是 family office principal。不是 PEP。
```

然后上传：

```text
chen-ming-kyc-demo.png
```

如果现场不方便传图，可用文字备用：

```text
使用手动证件信息。Referenced Document Type 是 Passport，Referenced Document No 是生成图上的编号，出生日期、国籍和有效期也按生成图填写。
```

预期 AI 行为：

- 识别或接收证件字段。
- 展示解析结果，让用户确认或纠错。
- 复述开户申请摘要。
- 明确说明“确认后将提交开户申请，仍需后台批准后才会生成账户”。

确认话术：

```text
确认并提交。
```

预期结果：

- AI 调用 `create_onboarding_application`。
- Telegram 返回申请编号和待审批状态。
- 后台 Onboarding 页面出现 pending application。
- 在后台批准该申请。
- 系统生成客户、账户、首笔入金交易和审计记录。

## 第三段：AI 辅助转账

Telegram 输入：

```text
帮 Zhang San 转 100,000 美元给 Li Si，备注是 family office fees。
```

预期 AI 行为：

- 查询客户和账户。
- 解析付款方 Zhang San 和收款方 Li Si。
- 复述付款账户、收款账户、金额、币种和备注。
- 要求用户确认，不能直接执行。

确认话术：

```text
确认。
```

预期结果：

- AI 调用 `create_transfer`。
- Zhang San 余额减少 100,000 USD。
- Li Si 余额增加 100,000 USD。
- 后台出现转账流水和审计日志。

## 第四段：AI 辅助购买理财

Telegram 输入：

```text
给 Zhang San 买 250,000 美元的 Global Balanced Portfolio，用他的 USD 私人银行账户扣款。
```

预期 AI 行为：

- 查询客户和账户。
- 查询产品。
- 复述产品名称、金额、风险等级和扣款账户。
- 要求用户确认，不能直接购买。

确认话术：

```text
确认。
```

预期结果：

- AI 调用 `purchase_product`。
- Zhang San 现金余额减少。
- 系统创建或增加持仓。
- 后台出现购买交易和审计日志。

## 失败和严谨性场景

### 资料不足的开户申请

Telegram 输入：

```text
帮客户 David Zhao 开一个私人银行账户。
```

预期行为：

- AI 要求提供证件图片或手动证件字段。
- AI 追问首笔入金、资金来源、地址、职业/职位、是否 PEP。
- 在资料完整并确认前，不调用开户工具。

### 未成年开户阻断

Telegram 输入：

```text
帮 Kevin Lin 开一个私人银行账户，首笔入金 300,000 美元，资金来自家庭赠与。
```

补充：

```text
居住地址是 12 Test Avenue, Shanghai。学生。不是 PEP。
```

上传：

```text
minor-client-kyc-demo.png
```

预期行为：

- AI 或服务端识别出生日期显示未满 18 岁。
- 系统阻断提交。
- 回复说明当前 demo 不允许未成年人开户。

### 余额不足转账

Telegram 输入：

```text
从 Li Si 的账户转 5,000,000 美元给 Zhang San。
```

预期行为：

- 如果字段足够清楚，AI 先要求确认。
- 服务端拒绝执行，因为 Li Si 余额不足。
- AI 原样转述工具返回的 `displayMessage`。

### 高风险产品不匹配

Telegram 输入：

```text
给 Zhang San 买 500,000 美元的 Private Equity Growth Fund。
```

预期行为：

- AI 说明产品是 high risk，而 Zhang San 默认风险等级是 medium。
- AI 要求明确确认已经知晓风险不匹配。
- 只有用户明确确认风险不匹配后，才允许购买。

### PEP 增强审查

Telegram 输入：

```text
帮客户 Olivia Tan 开私人银行账户，首笔入金 1,200,000 美元，资金来自企业股权出售。
```

补充：

```text
居住地址是 9 Orchard Road, Singapore。职业是上市公司董事。PEP: Yes。
```

上传：

```text
pep-client-kyc-demo.png
```

预期行为：

- AI 解析证件并复述开户摘要。
- 风险初评标记为 enhanced review。
- 允许提交开户申请，但后台应显示增强审查状态。

## 收尾讲解

讲解口径：

同一套银行业务服务层同时支撑后台人工操作和 OpenClaw MCP 工具。AI 没有绕过银行控制点，而是负责收集信息、识别证件字段、确认用户意图、调用结构化工具，并留下完整审计记录。
