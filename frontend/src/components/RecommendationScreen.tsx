import type { Reply } from '../types/consultation'
import { getMockPresentation } from '../mocks/consultation'
import { Icon } from './Icon'
// 순위표 대신 "이해한 내용 → 가장 빠른 방법 하나 → 다른 방법"의 순서로 보여 준다.
export function RecommendationScreen({ reply, query, mockMode, onContinue }: { reply: Reply; query: string; mockMode: boolean; onContinue: (channelId?: string) => void }) {
  const first = reply.recommendations[0]
  const others = reply.recommendations.slice(1)
  const ai = first?.channelId === 'CHATBOT' && first.processable === true
  const presentation = mockMode ? getMockPresentation(reply) : null
  const understood = presentation?.intent ?? reply.summary ?? query
  const heading = ai ? '바로 해결할 수 있어요' : first ? '이 방법이 가장 빨라요' : reply.responseType === 'UNRESOLVED' ? '이 문의는 안내하기 어려워요' : reply.responseType === 'FOLLOW_UP' ? '조금 더 알려 주세요' : '안내 내용을 확인해 주세요'
  return <main className="page-content recommendation-screen result-screen">
    <section className="rs-understood" aria-label="이해한 내용">
      <small>이해한 내용</small>
      <strong>{understood}</strong>
      {presentation && <span>{presentation.detail}</span>}
    </section>
    <h1>{heading}</h1>
    {first ? <section className="rs-answer" aria-label="추천 상담 방법">
      <h2><span className="rs-icon" aria-hidden="true"><Icon name="chat"/></span>{first.name}</h2>
      <ul>{(first.reasons ?? [first.reason]).map((reason, index) => <li key={index}>{reason}</li>)}</ul>
      {first.processable === false && <p className="rs-caution">이 방법으로는 처리가 어렵다고 안내되었어요.</p>}
    </section> : <section className="rs-answer"><p className="preserve-lines">{reply.message}</p></section>}
    {others.length > 0 && <section className="rs-others" aria-label="다른 상담 방법">
      <details>
        <summary>다른 방법도 있어요</summary>
        {others.map(item => <article key={item.channelId}><h2>{item.name}</h2>{(item.reasons ?? [item.reason]).map((reason, i) => <p key={i}>{reason}</p>)}<button type="button" className="rs-pick" onClick={() => onContinue(item.channelId)}>{item.name} 선택하기</button></article>)}
      </details>
    </section>}
    <div className="rs-foot">
      <p>실제 업무 처리는 해당 공식 화면에서 확인해 주세요.</p>
      {first
        ? <button className="primary-button" onClick={() => onContinue(first.channelId)}>{ai ? '바로 해결하기' : `${first.name} 선택하기`}</button>
        : <button className="primary-button" onClick={() => onContinue()}>대화 이어가기</button>}
    </div>
  </main>
}
