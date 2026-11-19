import { useEffect, useRef, useState } from 'react'
import { consultationApi, isMock } from './api'
import type { ConsultationApi } from './types/consultation'
import { EXAMPLE, CARD_EXAMPLE, QUESTION, getMockPresentation, type DemoMenu } from './mocks/consultation'
import { useConsultation } from './hooks/useConsultation'
import { ChatMessage } from './components/ChatMessage'
import { Composer } from './components/Composer'
import { ResultCard } from './components/ResultCard'
import { HomeScreen } from './components/HomeScreen'
import { RecommendationScreen } from './components/RecommendationScreen'
import { BusinessMenu } from './components/BusinessMenu'
import { HelpDock } from './components/HelpDock'
import { Icon } from './components/Icon'
import { AnalysisScreen } from './components/AnalysisScreen'
import { initialDemoTransfer } from './mocks/transfers'
type View = 'home' | 'inquiry' | 'analysis' | 'recommendation' | 'chat' | 'business' | 'help' | 'ended'
export default function App({ api = consultationApi, mockMode = isMock }: { api?: ConsultationApi; mockMode?: boolean }) {
  const chat = useConsultation(api, false)
  const [view, setView] = useState<View>('home')
  const [menu, setMenu] = useState<DemoMenu>('transfer')
  const [query, setQuery] = useState('')
  const [reading, setReading] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [transfer, setTransfer] = useState(initialDemoTransfer)
  const end = useRef<HTMLDivElement>(null)
  const main = useRef<HTMLDivElement>(null)
  const inquiryAttempt = useRef(0)
  const extras = mockMode ? getMockPresentation(chat.latest) : null
  const action = chat.latest?.actions?.[0]
  const actionLabel = selectedChannel === 'CHATBOT' ? action?.label ?? extras?.actionLabel : undefined
  const actionMenu = selectedChannel === 'CHATBOT' ? action?.menu ?? extras?.menu : undefined
  useEffect(() => { main.current?.focus(); main.current?.scrollTo?.(0, 0) }, [view])
  useEffect(() => { if (view === 'chat') end.current?.scrollIntoView({ block: 'nearest' }) }, [chat.messages, chat.pending, view])
  function enterConsultation() {
    setView(chat.messages.length > 1 ? 'chat' : 'inquiry')
    if (!chat.sessionId && !chat.pending) { setTransfer(initialDemoTransfer()); void chat.newConsultation() }
  }
  function reset() {
    inquiryAttempt.current++
    setQuery(''); setSelectedChannel(null); setView('inquiry')
    setTransfer(initialDemoTransfer())
    void chat.newConsultation()
  }
  function fill(text: string) { chat.setDraft(text); document.getElementById('message')?.focus() }
  async function submitInquiry() {
    const submitted = chat.draft.trim()
    if (!submitted || chat.pending || !chat.sessionId) return
    const attempt = ++inquiryAttempt.current
    setReading(submitted); setView('analysis')
    const started = Date.now()
    const result = await chat.send()
    // 체험 모드는 응답이 즉시 와서 "읽는 중" 화면이 스쳐 지나가므로 잠깐 보여 준다. 실제 API 응답은 늦추지 않는다.
    if (mockMode && import.meta.env.MODE !== 'test') await new Promise(resolve => setTimeout(resolve, Math.max(0, 1800 - (Date.now() - started))))
    if (attempt !== inquiryAttempt.current) return
    if (result) { setQuery(submitted); setView(result.responseType === 'CHANNEL_RECOMMENDATION' ? 'recommendation' : 'chat') }
    else setView('inquiry')
  }
  async function submitChat() {
    if (!chat.draft.trim() || chat.pending) return
    const result = await chat.send()
    if (result) setSelectedChannel(null)
    if (result?.responseType === 'CHANNEL_RECOMMENDATION') setView('recommendation')
  }
  function openMenu(kind: DemoMenu) { setMenu(kind); setView('business') }
  async function finish() {
    if (await chat.finishConsultation()) { setSelectedChannel(null); setQuery(''); setView('ended') }
  }
  function goHome() { inquiryAttempt.current++; setView('home') }
  const heading = { home: 'WON길', inquiry: '고객센터', analysis: '고객센터', recommendation: 'AI 추천 결과', chat: '고객센터', business: menu === 'transfer' ? '자동이체' : '카드 분실 안내', help: '도움말', ended: '고객센터' }[view]
  const errors = <>{chat.cleanupError && <div className="error" role="alert"><strong>이전 상담 종료 확인 필요</strong><p>{chat.cleanupError}</p></div>}{chat.error && <div className="error" role="alert"><strong>요청을 완료하지 못했어요</strong><p>{chat.error.message}</p><small>{chat.error.code} · 자동 재전송하지 않아요.</small>{!chat.sessionId && <button className="secondary-button" onClick={reset}>상담 다시 시작</button>}</div>}</>
  const loading = chat.pending && <div className="loading" role="status"><div className="loading-dots" aria-hidden="true"><i/><i/><i/></div><p>{chat.sessionId ? '문의 내용을 확인하고 있어요' : '새 상담을 준비하고 있어요'}</p></div>
  return <div className="workspace"><div className="app-shell">
    <a href="#screen" className="skip-link">본문으로 바로가기</a>
    {view !== 'home' && <header className="app-header"><button className="icon-button" disabled={view === 'business' && chat.pending} aria-label={view === 'business' ? '상담으로 돌아가기' : '홈으로 돌아가기'} onClick={view === 'business' ? enterConsultation : goHome}><Icon name="back"/></button><strong>{heading}</strong>{view !== 'business' && mockMode && <span className="mode-badge">가상 체험</span>}</header>}
    {view === 'chat' && <nav className="chat-toolbar" aria-label="상담 도구"><button onClick={reset}>↻ 새 상담</button></nav>}
    <div id="screen" className={`screen-view view-${view}`} ref={main} tabIndex={-1}>
      {view === 'home' && <HomeScreen onConsult={enterConsultation} onTransfer={() => mockMode ? openMenu('transfer') : enterConsultation()} onHelp={() => setView('help')}/>}
      {view === 'help' && <main className="page-content"><h1>무엇이 궁금하세요?</h1><HelpDock/><button className="primary-button" onClick={enterConsultation}>고객센터에서 문의하기</button></main>}
      {view === 'analysis' && <AnalysisScreen message={reading}/>}
      {view === 'inquiry' && <main className="page-content inquiry-screen">
        <h1>어떤 일이 있으셨어요?</h1><p className="lead">편하게 말씀해 주세요. 알맞은 방법을 바로 찾아드릴게요.</p>
        {mockMode && <section className="situation-cards" aria-label="자주 있는 상황"><button disabled={chat.pending} onClick={() => fill(CARD_EXAMPLE)}><strong>카드를 잃어버렸어요</strong><small>결제 문자가 왔어요</small><span aria-hidden="true">›</span></button><button disabled={chat.pending} onClick={() => fill(EXAMPLE)}><strong>자동이체 날짜를 바꾸고 싶어요</strong><small>월급날이 바뀌었어요</small><span aria-hidden="true">›</span></button></section>}
        <Composer draft={chat.draft} setDraft={chat.setDraft} disabled={chat.pending || !chat.sessionId} send={submitInquiry} submitLabel="이 내용으로 알아보기" placeholder="다른 일이라면 직접 말씀해 주세요" expanded/>
        {loading}{errors}
        {mockMode && <p className="mock-note">체험용 화면이라 위 두 상황만 안내해요.</p>}
        <HelpDock closed/>
      </main>}
      {view === 'recommendation' && chat.latest && <RecommendationScreen reply={chat.latest} query={query} mockMode={mockMode} onContinue={channelId => { setSelectedChannel(channelId ?? null); setView('chat') }}/>}
      {view === 'chat' && <main className="chat-page">
          <div role="log" aria-label="상담 메시지" aria-live="polite" aria-relevant="additions" className="conversation">
            {chat.messages.map(message => <ChatMessage key={message.id} message={message}/>)}
            {chat.pending && chat.pendingMessage !== null && <article className="message user"><div className="bubble">{chat.pendingMessage}</div></article>}
          </div>
          {loading}{errors}
          {!chat.pending && chat.latest?.responseType === 'CHANNEL_RECOMMENDATION' && selectedChannel && <><ResultCard key={`${chat.messages.at(-1)?.id}-${selectedChannel}`} reply={{ ...chat.latest, recommendations: chat.latest.recommendations.filter(item => item.channelId === selectedChannel) }} selected actionLabel={actionLabel} onAction={actionMenu ? () => openMenu(actionMenu) : undefined}/><button className="text-button" onClick={() => setView('recommendation')}>상담 방법 다시 선택하기</button></>}
          {mockMode && extras?.menu === 'transfer' && <button className="followup-example" disabled={chat.pending} onClick={() => fill(QUESTION)}>{QUESTION} <span aria-hidden="true">＋</span></button>}
          <HelpDock followup/>
          <div ref={end}/>
      </main>}
      {view === 'business' && <BusinessMenu key={menu} menu={menu} transfer={transfer} onChange={day => setTransfer(previous => ({ ...previous, day }))} onBack={enterConsultation} onFinish={() => void finish()} finishing={chat.pending} finishError={chat.error?.message}/>}
      {view === 'ended' && <main className="page-content ended-screen"><span className="ended-icon" aria-hidden="true">✓</span><h1>상담을 마쳤어요</h1><p>자동이체 날짜 변경 체험을 완료했어요.<br/>도움이 필요하면 새 상담을 시작해 주세요.</p><section className="transfer-account"><small>이번 상담 · 가상 체험</small><strong>{transfer.title} 자동이체</strong><span>변경 후 이체일 · 매월 {transfer.day}일</span></section><button className="primary-button" onClick={goHome}>홈으로</button><button className="secondary-button" onClick={reset}>새 상담 시작</button></main>}
    </div>
    {view === 'chat' && <Composer draft={chat.draft} setDraft={chat.setDraft} disabled={chat.pending || !chat.sessionId} send={submitChat}/>}
    {view === 'home' && mockMode && <footer className="app-footer">가상 체험</footer>}
  </div></div>
}

