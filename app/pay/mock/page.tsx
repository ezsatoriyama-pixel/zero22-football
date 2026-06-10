export default function MockPayPage() {
  return (
    <div className="max-w-page mx-auto px-6 py-16">
      <div className="bg-white rounded-card shadow-card p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-4">支付联调说明</h1>
        <div className="space-y-3 text-sm text-text-secondary leading-7">
          <p>当前页面是 Zero22 AI Football Lab 的本地支付联调占位页。</p>
          <p>已接入 2 种国内主流支付方式：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>微信支付（Native / JSAPI）</li>
            <li>支付宝（当面付 / 页面支付）</li>
          </ul>
          <p>
            当前站点中的 <code>/api/payment/create-order</code> 和 <code>/api/payment/confirm</code>{' '}
            为 mock 接口，方便你先把前后端流程跑通。
          </p>
          <p>后续接真实支付时，只需要：</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>微信支付：</strong>
              配置商户号 / APIv3 Key / 证书，替换创建订单 + 支付回调验签逻辑
            </li>
            <li>
              <strong>支付宝：</strong>
              配置 APPID / 商户私钥 / 支付宝公钥，替换创建订单 + 支付回调验签逻辑
            </li>
            <li>支付成功后调用会员升级逻辑</li>
            <li>把订单持久化到数据库</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
