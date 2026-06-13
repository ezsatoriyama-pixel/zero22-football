export default function DisclaimerPage() {
  return (
    <div>
      <section className="text-center pt-28 pb-24 px-6">
        <div className="max-w-page mx-auto">
          <h1 className="text-[76px] font-bold text-text-primary tracking-tight leading-[0.95]">
            免责声明
          </h1>
          <p className="mt-7 text-2xl text-text-secondary max-w-3xl mx-auto leading-snug">
            Zero22 AI Football Lab 免责声明
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-card p-12 shadow-card space-y-8 text-lg leading-relaxed">
          <p>
            本网站提供的所有赛事分析、数据统计、比分预测、胜率推演、AI模型报告及相关内容，仅基于公开数据、历史比赛记录及算法模型生成，<strong>仅供体育爱好者参考和学习交流使用</strong>。
          </p>

          <p>
            我们<strong>不保证</strong>任何预测结果的准确性、完整性或实时性。足球比赛受球队状态、伤病情况、战术调整、天气因素、裁判判罚等多种不可控因素影响，<strong>实际结果可能与预测结果存在较大差异</strong>。
          </p>

          <p>
            用户因参考本网站内容所作出的任何决策及产生的任何收益或损失，<strong>均由用户自行承担</strong>，本网站及运营方不承担任何责任。
          </p>

          <p className="text-red-600 font-bold">
            本网站不提供任何形式的博彩、赌博、投注服务，也不鼓励用户参与任何违法违规活动。
          </p>

          <p>
            所有球队名称、赛事名称及相关数据版权归原权利方所有，如有侵权请联系我们处理。
          </p>

          <p className="border-t border-border-light pt-6 text-text-tertiary">
            使用本网站即视为您已阅读、理解并同意本免责声明全部内容。
          </p>

          <p className="text-sm text-text-tertiary">
            最后更新时间：2026年6月
          </p>
        </div>
      </section>
    </div>
  );
}
