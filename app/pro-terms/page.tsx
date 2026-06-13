export default function ProTermsPage() {
  return (
    <div>
      <section className="text-center pt-28 pb-24 px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-[76px] font-bold text-text-primary tracking-tight leading-[0.95]">
            Pro 会员特别说明
          </h1>
          <p className="mt-7 text-2xl text-text-secondary max-w-3xl mx-auto leading-snug">
            关于 Pro 会员服务的重要说明
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-card p-12 shadow-card space-y-8 text-lg leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">服务内容</h2>
            <p>
              Pro会员服务提供更详细的AI分析报告、概率模型推演及数据可视化内容。
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">费用说明</h2>
            <p>
              Pro会员费用仅用于高级数据分析功能和服务器资源支持，<strong>不代表预测结果具有任何收益保证</strong>。
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">⚠️ 退款政策</h2>
            <p className="text-yellow-900">
              付费购买Pro会员后，<strong>不因比赛结果、预测偏差或个人主观原因提供退款服务</strong>（法律法规另有规定的除外）。
            </p>
          </div>

          <div className="border-t border-border-light pt-6">
            <h2 className="text-2xl font-bold text-text-primary mb-4">其他条款</h2>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>Pro会员权益为永久有效，一次购买终身使用</li>
              <li>所有预测数据基于AI模型运算，不构成投资建议</li>
              <li>我们保留调整服务内容的权利，但不影响已购买用户的核心权益</li>
              <li>严禁将会员权益用于任何违法违规用途</li>
            </ul>
          </div>

          <p className="border-t border-border-light pt-6 text-text-tertiary">
            购买Pro会员即视为您已阅读、理解并同意本特别说明全部内容。
          </p>

          <p className="text-sm text-text-tertiary">
            最后更新时间：2026年6月
          </p>
        </div>
      </section>
    </div>
  );
}
