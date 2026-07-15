# 支付接入决策：暂缓真实收款

检查日期：2026-05-15

## 结论

当前阶段不接入 Epusdt 或 Infini，继续保留现有 `SIMULATED` 模拟支付。

原因是现阶段的核心目标是验证“问题收集器能否收到真实需求”，不是验证用户付款意愿。真实支付会引入账号申请、合规、安全验签、异常订单、资金处理和运维成本，容易拖慢需求验证。

当前项目已有订单、支付记录、解锁记录和模拟支付闭环，但只有 `SIMULATED` provider，不具备生产收款能力。

## 外部方案判断

### Epusdt

资料：

- GitHub: https://github.com/GMwalletApp/epusdt
- GMPay 接入文档: https://epusdt.com/zh/guide/integration/gmpay

判断：

- 可以接入，是私有化部署的 Crypto 收款网关。
- 支持 HTTP API、创建交易、`notify_url` 回调和签名校验。
- 资金可直接进入自己的钱包，平台依赖较低。
- 主要成本是自部署、链监听、钱包安全、节点/网络异常和 Crypto 收款合规风险。

适用条件：

- 明确要自己掌控收款钱包。
- 接受自部署和长期维护支付网关。
- 能处理链上异常、少付、多付、超时、延迟到账等问题。

当前不推荐作为第一版真实支付。

### Infini

资料：

- 官网: https://www.infini.money/
- Hosted Checkout: https://developer.infini.money/docs/en/3-checkout-mode
- Webhook: https://developer.infini.money/docs/en/7-webhook
- Security: https://developer.infini.money/docs/en/10-security

判断：

- 更适合作为未来第一版真实支付。
- 商户侧创建订单后拿到 `checkout_url`，前端跳转到 Infini 托管收银台。
- Infini 负责支付页、币种/网络选择、二维码或地址展示、链上监控、状态同步和异常处理。
- 商户侧仍必须实现 webhook 验签、幂等、状态映射和异常订单处理。

适用条件：

- 面向海外、Twitter 或稳定币用户。
- 希望先用托管 checkout 减少前端和链上监听工作。
- 能接受平台账号/KYC、平台依赖、费率和服务可用性约束。

未来若恢复真实付费，优先研究 Infini Hosted Checkout。

## 当前项目决策

- 不修改支付代码。
- 不接真实支付 provider。
- 不改 checkout UI。
- 问题收集器继续作为第一阶段核心入口。
- `FREE_HELP_REQUEST` 不进入支付链路。
- 保留一元集市模拟支付，用于本地演示“下单 -> 模拟支付成功 -> 解锁内容”。

## 未来接入形状

如果后续要接真实支付，先做 provider 抽象，不要直接把外部 API 塞进现有 `payOrder()`。

推荐第一版：

- provider 增加为 `SIMULATED | INFINI`，Epusdt 暂不进入第一版。
- 下单后创建本地 `Order + Payment`。
- 服务端调用 Infini 创建远端订单。
- 前端拿到 `checkoutUrl` 后跳转到 Infini 托管收银台。
- 新增 Infini webhook route，校验签名、event id 和时间戳。
- webhook 收到 paid/completed 后，复用现有订单完成逻辑写入解锁记录。
- expired、partial paid、late payment 不直接解锁，进入后台异常订单。

## 后续测试要求

当前暂缓接入，不新增测试。

如果进入 Infini 接入阶段，必须覆盖：

- provider schema：允许 `SIMULATED` 和 `INFINI`，拒绝未知 provider。
- 创建支付：成功返回 `checkoutUrl`；Infini API 失败时本地订单保持可追踪。
- webhook 验签：缺签名、签名错误、时间戳过期、重复 event id 都要覆盖。
- 状态映射：paid/completed 解锁；expired、partial paid、late payment 不解锁。
- 回归检查：`npm run lint`、`npm test`、`npm run build`。

## 复用判断

判断一个支付方案是否该接，先问三件事：

1. 当前阶段验证目标是不是收款。
2. 谁承担收银台、链上监听和异常处理。
3. 失败订单能不能被后台追踪和补救。

如果第一项不是收款，先别接。
如果第二项主要由自己承担，不要在 MVP 早期引入。
