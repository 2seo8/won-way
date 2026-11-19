// 고객이 쓴 문장을 그대로 보여 주며 핵심 표현을 차례로 표시한다. 표시만 할 뿐 의미를 해석해 단정하지 않는다.
const KEYWORDS = /(\d{1,2}일|자동이체|이체|생활비|월급날|월급|카드|분실|잃어버렸|결제|문자|날짜)/g

function highlight(text: string) {
  let index = 0
  return text.split(KEYWORDS).map((part, i) => i % 2 === 1
    ? <mark key={i} style={{ animationDelay: `${0.35 + index++ * 0.28}s` }}>{part}</mark>
    : part)
}

export function AnalysisScreen({ message = '' }: { message?: string }) {
  return <main className="analysis-screen" aria-busy="true">
    <div role="status" aria-live="polite" className="analysis-body">
      <p className="analysis-label">말씀하신 내용을 읽고 있어요</p>
      {message && <blockquote className="analysis-quote">{highlight(message)}</blockquote>}
      <div className="analysis-dots" aria-hidden="true"><i/><i/><i/></div>
      <p className="analysis-sub">알맞은 방법을 찾고 있어요</p>
    </div>
  </main>
}
