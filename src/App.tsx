import { useState, useEffect, useRef } from 'react';
import './App.css';

interface AlarmData {
  targetTime: string;
  label: string;
  displayTime: string;
  hours: number;
}

interface ExtraModifier {
  id: string;
  label: string;
  hours: number;
}

interface HeartData {
  id: number;
  left: string;
  duration: string;
  delay: string;
  visible: boolean;
}

interface NapRecord {
  date: string;
  hours: number;
  label: string;
}

interface StreakData {
  lastNapDate: string;
  count: number;
  totalNaps: number;
  totalHours: number;
}

const cuteMessages = [
  "Bons sonhos, meu amor...",
  "Dorme bem, amanhã o dia vai ser incrível!",
  "Carregando as baterias da Momo... 50%",
  "Amo você daqui até a lua!",
  "Descansa, minha princesa..."
];

const secretLoveMessages = [
  "Você é o amor da minha vida! 💖",
  "Meu dengo! 🥰",
  "Te amo infinitamente! 💘",
  "Minha princesa! 👑",
  "Para de clicar e vai mimir! 😂❤️"
];

const motivosTexts = [
  'Motivos:',
  'Desculpas pra mimir:',
  'Razões científicas:',
  'Justificativas sérias:',
  'Porque sim:',
  'Culpa do Momo:',
];

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 95}%`,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 2.5 + 0.5}px`,
  delay: `${Math.random() * 5}s`,
  duration: `${2 + Math.random() * 4}s`,
}));

const SHOOTING_STARS_BG = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  top: `${5 + Math.random() * 35}%`,
  left: `${Math.random() * 50}%`,
  delay: `${i * 4 + Math.random() * 3}s`,
  duration: `${3 + Math.random() * 2}s`,
}));

const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => new Date(Date.now() - 86400000).toISOString().split('T')[0];

const getStreakTitle = (count: number): string => {
  if (count >= 30) return 'Lendária! 🏆';
  if (count >= 14) return 'Mestra do Descanso 👑';
  if (count >= 7) return 'Rainha do Soninho 🌟';
  if (count >= 3) return 'Dedicada! 😴';
  return 'Começando! 🌱';
};

const getPlatform = (): 'ios' | 'android' | 'other' => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
};

const formatHours = (h: number): string => {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}min`;
};

const formatHistoryDate = (dateStr: string): string => {
  if (dateStr === getToday()) return 'Hoje';
  if (dateStr === getYesterday()) return 'Ontem';
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

export default function App() {
  const [alarm, setAlarm] = useState<AlarmData | null>(null);
  const [pendingAlarm, setPendingAlarm] = useState<AlarmData | null>(null);
  const [recoveredPending, setRecoveredPending] = useState(false);
  const [selectedBase, setSelectedBase] = useState<{ id: string; label: string; hours: number } | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ExtraModifier[]>([]);

  const [messageIndex, setMessageIndex] = useState(0);
  const [isRaining, setIsRaining] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const rainAudio = useRef(new Audio('/rain.ogg'));

  const [, setEmojiClicks] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  const [hearts, setHearts] = useState<HeartData[]>([]);
  const [, setHeartClickCount] = useState(0);

  const [customAlert, setCustomAlert] = useState<string | null>(null);
  const [loveMessage, setLoveMessage] = useState<string | null>(null);
  const [, setBrigueiCount] = useState(0);
  const [titleText, setTitleText] = useState("Oii momo!");

  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // New features
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [napHistory, setNapHistory] = useState<NapRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [, setMoonClicks] = useState(0);
  const [showShootingStar, setShowShootingStar] = useState(false);
  const [motivosIndex, setMotivosIndex] = useState(0);

  // Compute preview wake time from current selection
  let previewWakeTime: string | null = null;
  if (showCustom) {
    const h = parseInt(customHours) || 0;
    const m = parseInt(customMinutes) || 0;
    const total = h + m / 60;
    if (total > 0) {
      const t = new Date(Date.now() + total * 3600000);
      previewWakeTime = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
    }
  } else if (selectedBase) {
    const extra = selectedExtras.reduce((acc, e) => acc + e.hours, 0);
    const total = selectedBase.hours + extra;
    const t = new Date(Date.now() + total * 3600000);
    previewWakeTime = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
  }

  const weekStats = (() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const week = napHistory.filter(r => r.date >= weekAgo);
    return { naps: week.length, hours: week.reduce((acc, r) => acc + r.hours, 0) };
  })();

  useEffect(() => {
    const savedAlarm = localStorage.getItem('momo_naninha');
    if (savedAlarm) {
      setAlarm(JSON.parse(savedAlarm));
    } else {
      const savedPending = localStorage.getItem('momo_pending_naninha');
      if (savedPending) {
        setPendingAlarm(JSON.parse(savedPending));
        setRecoveredPending(true);
      }
    }

    const savedStreak = localStorage.getItem('momo_streak');
    if (savedStreak) setStreakData(JSON.parse(savedStreak));

    const savedHistory = localStorage.getItem('momo_history');
    if (savedHistory) setNapHistory(JSON.parse(savedHistory));

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (alarm) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      setIsRaining(false);
    }
  }, [alarm]);

  useEffect(() => {
    if (!alarm) return;

    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % cuteMessages.length);
    }, 300000);

    const alarmInterval = setInterval(() => {
      const now = new Date();
      const target = new Date(alarm.targetTime);
      if (now >= target) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Hora da naninha, Momo!', {
            body: 'Seu tempo de descanso acabou, hora de acordar!',
          });
        } else {
          setCustomAlert('Hora da naninha, Momo! Seu tempo de descanso acabou! ☀️');
        }
        setAlarm(null);
        localStorage.removeItem('momo_naninha');
      }
    }, 5000);

    return () => {
      clearInterval(alarmInterval);
      clearInterval(msgInterval);
    };
  }, [alarm]);

  useEffect(() => {
    if (!alarm) {
      setTimeLeft(null);
      return;
    }
    const update = () => {
      const diff = new Date(alarm.targetTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('0min'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 0 ? `${h}h ${m}min` : `${m}min`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [alarm]);

  useEffect(() => {
    rainAudio.current.loop = true;
    rainAudio.current.volume = volume;
    if (isRaining) {
      rainAudio.current.play().catch(() => setIsRaining(false));
    } else {
      rainAudio.current.pause();
    }
    return () => { rainAudio.current.pause(); };
  }, [isRaining]);

  useEffect(() => {
    rainAudio.current.volume = volume;
  }, [volume]);

  const recordNap = (hours: number, label: string) => {
    const today = getToday();
    const history: NapRecord[] = JSON.parse(localStorage.getItem('momo_history') || '[]');
    const filtered = history.filter(r => r.date !== today);
    const updated = [{ date: today, hours, label }, ...filtered].slice(0, 30);
    localStorage.setItem('momo_history', JSON.stringify(updated));
    setNapHistory(updated);
  };

  const updateStreak = (hours: number, label: string) => {
    recordNap(hours, label);
    const today = getToday();
    const yesterday = getYesterday();
    const saved = localStorage.getItem('momo_streak');
    const current: StreakData = saved ? JSON.parse(saved) : { lastNapDate: '', count: 0, totalNaps: 0, totalHours: 0 };

    let newCount = 1;
    if (current.lastNapDate === today) {
      newCount = current.count;
    } else if (current.lastNapDate === yesterday) {
      newCount = current.count + 1;
    }

    const isNewDay = current.lastNapDate !== today;
    const updated: StreakData = {
      lastNapDate: today,
      count: newCount,
      totalNaps: current.totalNaps + (isNewDay ? 1 : 0),
      totalHours: current.totalHours + hours,
    };

    localStorage.setItem('momo_streak', JSON.stringify(updated));
    setStreakData(updated);

    // Milestone celebrations
    const milestones: Record<number, string> = {
      3: "🌟 3 dias seguidos de naninha! Você é incrível!",
      7: "👑 UMA SEMANA de nanihas! Rainha do descanso!",
      14: "🏆 14 dias! Você é uma mestra do soninho!",
      30: "🎉 30 DIAS! Você é uma lenda da naninha! ✨",
    };

    if (isNewDay && milestones[newCount]) {
      setTimeout(() => { setCustomAlert(milestones[newCount]); startHeartsFall(); }, 800);
    }

    // 24h total milestone
    if (Math.floor(updated.totalHours) >= 24 && Math.floor(current.totalHours) < 24) {
      setTimeout(() => setCustomAlert("🎉 Você já dormiu 24 horas no total! Um dia inteiro de descanso! 😴✨"), 1200);
    }
  };

  const openNativeAlarm = (displayTime: string) => {
    const [h, m] = displayTime.split(':').map(Number);
    const platform = getPlatform();
    if (platform === 'android') {
      window.location.href = `intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${h};i.android.intent.extra.alarm.MINUTES=${m};S.android.intent.extra.alarm.MESSAGE=Naninha%20Momo;B.android.intent.extra.alarm.SKIP_UI=false;end`;
    } else if (platform === 'ios') {
      window.location.href = 'clock://';
    } else {
      setCustomAlert('No computador, configure o alarme manualmente no celular. O evento .ics foi baixado para adicionar ao seu calendário!');
    }
  };

  const handleTitleClick = () => {
    setTitleText("Oii minha vida! 💖");
    setTimeout(() => setTitleText("Oii momo!"), 3000);
  };

  const handleEmojiClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEmojiClicks((prev) => {
      const current = prev + 1;
      if (current === 3) startHeartsFall();
      return current;
    });
  };

  const startHeartsFall = () => {
    const newHearts = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 1.5}s`,
      visible: true,
    }));
    setHearts(newHearts);
    setShowHearts(true);
    setHeartClickCount(0);
    setTimeout(() => { setShowHearts(false); setEmojiClicks(0); }, 8000);
  };

  const handleHeartClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHearts(prev => prev.map(h => h.id === id ? { ...h, visible: false } : h));
    setHeartClickCount(prev => {
      const next = prev + 1;
      if (next % 5 === 0) {
        const msgIndex = (next / 5 - 1) % secretLoveMessages.length;
        setLoveMessage(secretLoveMessages[msgIndex]);
        setTimeout(() => setLoveMessage(null), 3000);
      }
      return next;
    });
  };

  const handleMoonClick = () => {
    setMoonClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setShowShootingStar(true);
        setLoveMessage("Sonhos lindos, meu amor! 🌠");
        setTimeout(() => { setShowShootingStar(false); setLoveMessage(null); }, 2500);
        return 0;
      }
      return next;
    });
  };

  const handleMotivosClick = () => {
    setMotivosIndex(prev => (prev + 1) % motivosTexts.length);
  };

  const toggleRain = () => setIsRaining(!isRaining);

  const toggleExtra = (extra: ExtraModifier) => {
    if (extra.id === 'ext3') {
      setBrigueiCount(prev => {
        const current = prev + 1;
        if (current === 3) {
          setCustomAlert("Mentira! A gente nunca briga de verdade! Te amo muito! ❤️");
          return 0;
        }
        return current;
      });
    }
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleGenerateTime = () => {
    let baseHours = 0;
    let baseLabel = '';

    if (showCustom) {
      const h = parseInt(customHours) || 0;
      const m = parseInt(customMinutes) || 0;
      baseHours = h + m / 60;
      if (baseHours === 0) {
        setCustomAlert('Mas você não vai dormir nada?! Coloque pelo menos um tempinho! 😱');
        return;
      }
      if (baseHours > 10) {
        setCustomAlert('Nossa, vai dormir o dia todo! 😅 Tá bem, configurei aqui...');
      }
      baseLabel = `Personalizado (${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}min` : ''})`;
    } else {
      if (!selectedBase) {
        setCustomAlert('Por favor, selecione pelo menos uma opção de soninho!');
        return;
      }
      baseHours = selectedBase.hours;
      baseLabel = selectedBase.label;
    }

    const extraHours = selectedExtras.reduce((acc, curr) => acc + curr.hours, 0);
    const totalHours = baseHours + extraHours;
    let fullLabel = baseLabel;
    if (selectedExtras.length > 0) {
      fullLabel += ` + ${selectedExtras.map((e) => e.label).join(', ')}`;
    }

    const now = new Date();
    const target = new Date(now.getTime() + totalHours * 60 * 60 * 1000);

    const newPending: AlarmData = {
      targetTime: target.toISOString(),
      label: fullLabel,
      displayTime: `${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`,
      hours: totalHours,
    };

    setPendingAlarm(newPending);
    setRecoveredPending(false);
    localStorage.setItem('momo_pending_naninha', JSON.stringify(newPending));
  };

  const confirmAlarm = () => {
    if (!pendingAlarm) return;

    // Late night easter egg
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) {
      setTimeout(() => setCustomAlert("Momo... tá dormindo muito tarde! 🌚 Cuida de você, tá?"), 600);
    }

    updateStreak(pendingAlarm.hours, pendingAlarm.label);
    setAlarm(pendingAlarm);
    localStorage.setItem('momo_naninha', JSON.stringify(pendingAlarm));
    localStorage.removeItem('momo_pending_naninha');

    const target = new Date(pendingAlarm.targetTime);
    const formatICSDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(target)}`,
      `DTEND:${formatICSDate(target)}`,
      'SUMMARY:Hora de Acordar, Momo!',
      'DESCRIPTION:Seu tempo de descanso acabou.',
      'BEGIN:VALARM',
      'TRIGGER:-PT0M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Hora de Acordar, Momo!',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'naninha_momo.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setPendingAlarm(null);
    setSelectedBase(null);
    setSelectedExtras([]);
    setShowCustom(false);
    setCustomHours('');
    setCustomMinutes('');
    setRecoveredPending(false);

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const cancelPending = () => {
    setPendingAlarm(null);
    localStorage.removeItem('momo_pending_naninha');
    setRecoveredPending(false);
  };

  const cancelAlarm = () => {
    setAlarm(null);
    localStorage.removeItem('momo_naninha');
    setIsRaining(false);
    setShowCancelConfirm(false);
  };

  const platform = getPlatform();

  return (
    <div className="container">
      {/* Stars background — only during sleep */}
      {alarm && (
        <div className="stars-bg">
          {STARS.map(s => (
            <div
              key={s.id}
              className="star"
              style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration }}
            />
          ))}
          {SHOOTING_STARS_BG.map(s => (
            <div
              key={s.id}
              className="shooting-star-bg"
              style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.duration }}
            />
          ))}
        </div>
      )}

      {showShootingStar && (
        <div className="shooting-star-easter" />
      )}

      {customAlert && (
        <div className="modal-overlay" onClick={() => setCustomAlert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>{customAlert}</p>
            <button className="modal-btn" onClick={() => setCustomAlert(null)}>Entendido</button>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>Tem certeza que quer acordar agora? 🌙</p>
            <div className="modal-buttons">
              <button className="modal-btn" onClick={cancelAlarm}>Sim, acordei!</button>
              <button className="modal-btn-secondary" onClick={() => setShowCancelConfirm(false)}>Não, continua</button>
            </div>
          </div>
        </div>
      )}

      {loveMessage && (
        <div className="love-message-popup">{loveMessage}</div>
      )}

      {showHearts && (
        <div className="hearts-container">
          {hearts.map((h) => h.visible && (
            <div
              key={h.id}
              className="heart"
              onClick={(e) => handleHeartClick(h.id, e)}
              style={{ left: h.left, animationDuration: h.duration, animationDelay: h.delay }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <img src="/logo.png" alt="Logo Naninha" className="app-logo" />

        <h1 onClick={handleTitleClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
          {titleText}
          <span onClick={handleEmojiClick} className="emoji-title"> 😴</span>
        </h1>

        {/* Streak + stats bar */}
        {streakData && streakData.count > 0 && !alarm && (
          <div className="streak-bar" onClick={() => setShowHistory(!showHistory)} role="button" tabIndex={0}>
            <span className="streak-flame">🌙</span>
            <span className="streak-count">{streakData.count} {streakData.count === 1 ? 'dia' : 'dias'}</span>
            <span className="streak-sep">•</span>
            <span className="streak-title-text">{getStreakTitle(streakData.count)}</span>
            {weekStats.naps > 0 && (
              <>
                <span className="streak-sep">•</span>
                <span className="streak-week">{weekStats.naps}× semana</span>
              </>
            )}
            <span className="streak-caret">{showHistory ? '▲' : '▼'}</span>
          </div>
        )}

        {/* History panel */}
        {showHistory && !alarm && (
          <div className="history-panel">
            <div className="history-stats">
              <div className="stat-item">
                <span className="stat-number">{streakData?.totalNaps ?? 0}</span>
                <span className="stat-label">nanihas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{formatHours(streakData?.totalHours ?? 0)}</span>
                <span className="stat-label">dormidas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{formatHours(weekStats.hours)}</span>
                <span className="stat-label">essa semana</span>
              </div>
            </div>
            {napHistory.length === 0 ? (
              <p className="history-empty">Sem histórico ainda. Hora de tirar a primeira naninha! 😴</p>
            ) : (
              <div className="history-list">
                {napHistory.slice(0, 7).map((n, i) => (
                  <div key={i} className="history-item">
                    <span className="history-date">{formatHistoryDate(n.date)}</span>
                    <span className="history-hours">{formatHours(n.hours)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!alarm && !recoveredPending && <p className="subtitle">Está na hora de tirar uma naninha.</p>}

        {!alarm && !pendingAlarm && (
          <div className="selection-area">
            <div className="selection-header">
              <p className="question" style={{ margin: 0 }}>Quando você deverá mimir?</p>
              <button
                className={`btn-custom-toggle ${showCustom ? 'active' : ''}`}
                onClick={() => { setShowCustom(!showCustom); setSelectedBase(null); }}
              >
                {showCustom ? '← Opções' : '⏱️ Personalizar'}
              </button>
            </div>

            {!showCustom ? (
              <div className="buttons-group" style={{ marginTop: 16 }}>
                <button
                  className={`btn btn-high ${selectedBase?.id === 'base1' ? 'selected' : ''}`}
                  onClick={() => setSelectedBase({ id: 'base1', label: 'TÔ SONINHO', hours: 3 })}
                >
                  TÔ SONINHO
                </button>
                <button
                  className={`btn btn-medium ${selectedBase?.id === 'base2' ? 'selected' : ''}`}
                  onClick={() => setSelectedBase({ id: 'base2', label: 'POUCO SONINHO', hours: 2.5 })}
                >
                  POUCO SONINHO
                </button>
                <button
                  className={`btn btn-low ${selectedBase?.id === 'base3' ? 'selected' : ''}`}
                  onClick={() => setSelectedBase({ id: 'base3', label: 'SÓ QUERO DESCANSAR', hours: 2 })}
                >
                  SÓ QUERO DESCANSAR
                </button>
              </div>
            ) : (
              <div className="custom-duration-area">
                <p className="custom-duration-label">Quanto tempo de soninho?</p>
                <div className="custom-inputs">
                  <div className="custom-input-wrap">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      placeholder="0"
                      className="custom-input"
                    />
                    <span className="custom-unit">h</span>
                  </div>
                  <div className="custom-input-wrap">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      placeholder="30"
                      className="custom-input"
                    />
                    <span className="custom-unit">min</span>
                  </div>
                </div>
              </div>
            )}

            <p className="question extras-title">Adicionais de cansaço:</p>

            <div className="buttons-group extras-group">
              <button
                className={`btn btn-extra ${selectedExtras.some(e => e.id === 'ext1') ? 'selected' : ''}`}
                onClick={() => toggleExtra({ id: 'ext1', label: 'Manhã difícil', hours: 0.5 })}
              >
                Manhã difícil <span className="extra-badge">+30min</span>
              </button>
              <button
                className={`btn btn-extra ${selectedExtras.some(e => e.id === 'ext2') ? 'selected' : ''}`}
                onClick={() => toggleExtra({ id: 'ext2', label: 'Aula muito chata', hours: 1 })}
              >
                Aula muito chata <span className="extra-badge">+1h</span>
              </button>
              <button
                className={`btn btn-extra ${selectedExtras.some(e => e.id === 'ext3') ? 'selected' : ''}`}
                onClick={() => toggleExtra({ id: 'ext3', label: 'Briguei', hours: 3 })}
              >
                Briguei <span className="extra-badge">+3h</span>
              </button>
            </div>

            {previewWakeTime && (
              <div className="preview-time">
                <span className="preview-label">Previsão de acordar:</span>
                <span className="preview-value">{previewWakeTime}</span>
              </div>
            )}

            <button className="btn-generate" onClick={handleGenerateTime}>
              MOMO, ATÉ QUE HORAS EU VOU MIMIR?
            </button>
          </div>
        )}

        {pendingAlarm && !alarm && (
          <div className="confirmation-area">
            {recoveredPending ? (
              <p className="highlight-text recovered">
                Opa! Você esqueceu de ativar seu alarme para as <strong>{pendingAlarm.displayTime}</strong>
              </p>
            ) : (
              <p className="highlight-text">
                O despertador vai tocar às <strong>{pendingAlarm.displayTime}</strong>
              </p>
            )}

            <div className="native-alarm-hint">
              <p className="hint-text">
                {platform === 'android' ? '📱 Quer definir também no Relógio do Android?' :
                 platform === 'ios' ? '📱 Quer abrir o Relógio do iPhone?' :
                 '📅 O evento .ics será baixado para o seu Calendário'}
              </p>
              {platform !== 'other' && (
                <button className="btn-native-alarm" onClick={() => openNativeAlarm(pendingAlarm.displayTime)}>
                  {platform === 'android' ? '⏰ Definir Alarme no Relógio' : '⏰ Abrir Relógio do iPhone'}
                </button>
              )}
            </div>

            <div className="action-buttons">
              <button className="btn-confirm" onClick={confirmAlarm}>✨ Ativar Naninha</button>
              <button className="btn-cancel" onClick={cancelPending}>Voltar</button>
            </div>
          </div>
        )}

        {alarm && (
          <div className="active-alarm-area">
            <div className="alarm-status">
              <span
                className="pulse-icon"
                onClick={handleMoonClick}
                style={{ cursor: 'pointer' }}
                title="Clique 3x para surpresa ✨"
              >
                🌙
              </span>
              <p>Shhh... Você já está dormindo até as <strong>{alarm.displayTime}</strong></p>

              {timeLeft && (
                <div className="time-left">
                  Faltam <span className="time-left-value">{timeLeft}</span>
                </div>
              )}

              <p key={messageIndex} className="cute-message">
                {cuteMessages[messageIndex]}
              </p>

              <p className="alarm-label" onClick={handleMotivosClick} style={{ cursor: 'pointer' }}>
                {motivosTexts[motivosIndex]} {alarm.label}
              </p>
            </div>

            <div className="action-buttons-column">
              <button className={`btn-rain ${isRaining ? 'active' : ''}`} onClick={toggleRain}>
                {isRaining ? '🌧️ Desligar Chuva' : '🎧 Som de Chuva'}
              </button>

              {isRaining && (
                <div className="volume-control">
                  <span className="vol-icon">🔇</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="vol-icon">🔊</span>
                </div>
              )}

              <button className="btn-cancel-dark" onClick={() => setShowCancelConfirm(true)}>
                Acordei mais cedo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
