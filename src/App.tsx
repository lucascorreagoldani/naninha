import { useState, useEffect, useRef } from 'react';
import './App.css';

interface AlarmData {
  targetTime: string;
  label: string;
  displayTime: string;
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

export default function App() {
  const [alarm, setAlarm] = useState<AlarmData | null>(null);
  const [pendingAlarm, setPendingAlarm] = useState<AlarmData | null>(null);
  const [recoveredPending, setRecoveredPending] = useState(false);
  const [selectedBase, setSelectedBase] = useState<{ id: string; label: string; hours: number } | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ExtraModifier[]>([]);

  const [messageIndex, setMessageIndex] = useState(0);
  const [isRaining, setIsRaining] = useState(false);
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

  // Compute preview wake time from current selection (inline, no extra state needed)
  let previewWakeTime: string | null = null;
  if (selectedBase) {
    const extraHours = selectedExtras.reduce((acc, e) => acc + e.hours, 0);
    const total = selectedBase.hours + extraHours;
    const target = new Date(Date.now() + total * 3600000);
    previewWakeTime = `${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;
  }

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
          setCustomAlert('Hora da naninha, Momo! Seu tempo de descanso acabou!');
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

  // Countdown timer — updates every second while alarm is active
  useEffect(() => {
    if (!alarm) {
      setTimeLeft(null);
      return;
    }
    const update = () => {
      const diff = new Date(alarm.targetTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('0min');
        return;
      }
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
    if (isRaining) {
      rainAudio.current.play().catch(() => setIsRaining(false));
    } else {
      rainAudio.current.pause();
    }
    return () => {
      rainAudio.current.pause();
    };
  }, [isRaining]);

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
      visible: true
    }));
    setHearts(newHearts);
    setShowHearts(true);
    setHeartClickCount(0);

    setTimeout(() => {
      setShowHearts(false);
      setEmojiClicks(0);
    }, 8000);
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
    if (!selectedBase) {
      setCustomAlert('Por favor, selecione pelo menos uma opção de soninho!');
      return;
    }

    const extraHours = selectedExtras.reduce((acc, curr) => acc + curr.hours, 0);
    const totalHours = selectedBase.hours + extraHours;

    let fullLabel = selectedBase.label;
    if (selectedExtras.length > 0) {
      fullLabel += ` + ${selectedExtras.map((e) => e.label).join(', ')}`;
    }

    const now = new Date();
    const target = new Date(now.getTime() + totalHours * 60 * 60 * 1000);

    const newPending = {
      targetTime: target.toISOString(),
      label: fullLabel,
      displayTime: `${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`,
    };

    setPendingAlarm(newPending);
    setRecoveredPending(false);
    localStorage.setItem('momo_pending_naninha', JSON.stringify(newPending));
  };

  const confirmAlarm = () => {
    if (!pendingAlarm) return;

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

  return (
    <div className="container">
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
        <div className="love-message-popup">
          {loveMessage}
        </div>
      )}

      {showHearts && (
        <div className="hearts-container">
          {hearts.map((h) => (
            h.visible && (
              <div
                key={h.id}
                className="heart"
                onClick={(e) => handleHeartClick(h.id, e)}
                style={{
                  left: h.left,
                  animationDuration: h.duration,
                  animationDelay: h.delay
                }}
              >
                ❤️
              </div>
            )
          ))}
        </div>
      )}

      <div className="card">
        <img src="/logo.png" alt="Logo Naninha" className="app-logo" />

        <h1 onClick={handleTitleClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
          {titleText}
          <span onClick={handleEmojiClick} className="emoji-title"> 😴</span>
        </h1>

        {!alarm && !recoveredPending && <p className="subtitle">Está na hora de tirar uma naninha.</p>}

        {!alarm && !pendingAlarm && (
          <div className="selection-area">
            <p className="question">Quando você deverá mimir?</p>

            <div className="buttons-group">
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
            <div className="action-buttons">
              <button className="btn-confirm" onClick={confirmAlarm}>Ativar Alarme</button>
              <button className="btn-cancel" onClick={cancelPending}>Voltar</button>
            </div>
          </div>
        )}

        {alarm && (
          <div className="active-alarm-area">
            <div className="alarm-status">
              <span className="pulse-icon">🌙</span>
              <p>Shhh... Você já está dormindo até as <strong>{alarm.displayTime}</strong></p>

              {timeLeft && (
                <div className="time-left">
                  Faltam <span className="time-left-value">{timeLeft}</span>
                </div>
              )}

              <p key={messageIndex} className="cute-message">
                {cuteMessages[messageIndex]}
              </p>

              <p className="alarm-label">Motivos: {alarm.label}</p>
            </div>

            <div className="action-buttons-column">
              <button className={`btn-rain ${isRaining ? 'active' : ''}`} onClick={toggleRain}>
                {isRaining ? '🌧️ Desligar Chuva' : '🎧 Som de Chuva'}
              </button>
              <button className="btn-cancel-dark" onClick={() => setShowCancelConfirm(true)}>Acordei mais cedo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
