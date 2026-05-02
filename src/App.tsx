import { useState, useEffect } from 'react';
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

const cuteMessages = [
  "Bons sonhos, meu amor...",
  "Dorme bem, amanhã o dia vai ser incrível!",
  "Carregando as baterias da Momo... 50%",
  "Amo você daqui até a lua!",
  "Descansa, minha princesa..."
];

export default function App() {
  const [alarm, setAlarm] = useState<AlarmData | null>(null);
  const [pendingAlarm, setPendingAlarm] = useState<AlarmData | null>(null);
  const [selectedBase, setSelectedBase] = useState<{ id: string; label: string; hours: number } | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ExtraModifier[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isRaining, setIsRaining] = useState(false);
  const [rainAudio] = useState(new Audio('https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg'));
  const [, setEmojiClicks] = useState(0);
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('momo_naninha');
    if (saved) {
      setAlarm(JSON.parse(saved));
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

    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(alarm.targetTime);

      if (now >= target) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Hora da naninha, Momo!', {
            body: 'Seu tempo de descanso acabou, hora de acordar!',
          });
        } else {
          alert('Hora da naninha, Momo! Seu tempo de descanso acabou!');
        }
        setAlarm(null);
        localStorage.removeItem('momo_naninha');
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, [alarm]);

  useEffect(() => {
    rainAudio.loop = true;
    if (isRaining) {
      rainAudio.play().catch(() => setIsRaining(false));
    } else {
      rainAudio.pause();
    }
    return () => {
      rainAudio.pause();
    };
  }, [isRaining, rainAudio]);

  const handleEmojiClick = () => {
    setEmojiClicks((prev) => {
      const current = prev + 1;
      if (current === 3) {
        setShowHearts(true);
        setTimeout(() => {
          setShowHearts(false);
          setEmojiClicks(0);
        }, 5000);
      }
      return current;
    });
  };

  const toggleRain = () => {
    setIsRaining(!isRaining);
  };

  const toggleExtra = (extra: ExtraModifier) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleGenerateTime = () => {
    if (!selectedBase) {
      alert('Por favor, selecione pelo menos uma opção de soninho!');
      return;
    }

    const extraHours = selectedExtras.reduce((acc, curr) => acc + curr.hours, 0);
    const totalHours = selectedBase.hours + extraHours;

    let fullLabel = selectedBase.label;
    if (selectedExtras.length > 0) {
      const extraLabels = selectedExtras.map((e) => e.label).join(', ');
      fullLabel += ` + ${extraLabels}`;
    }

    const now = new Date();
    const target = new Date(now.getTime() + totalHours * 60 * 60 * 1000);

    const hoursStr = target.getHours().toString().padStart(2, '0');
    const minutesStr = target.getMinutes().toString().padStart(2, '0');

    setPendingAlarm({
      targetTime: target.toISOString(),
      label: fullLabel,
      displayTime: `${hoursStr}:${minutesStr}`,
    });
  };

  const confirmAlarm = () => {
    if (pendingAlarm) {
      setAlarm(pendingAlarm);
      localStorage.setItem('momo_naninha', JSON.stringify(pendingAlarm));

      const target = new Date(pendingAlarm.targetTime);
      
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

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

      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  };

  const cancelAlarm = () => {
    setAlarm(null);
    localStorage.removeItem('momo_naninha');
    setIsRaining(false);
  };

  return (
    <div className="container">
      {showHearts && (
        <div className="hearts-container">
          {Array.from({ length: 25 }).map((_, i) => (
            <div 
              key={i} 
              className="heart" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                animationDuration: `${2 + Math.random() * 3}s` 
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h1>
          Oii momo! 
          <span 
            onClick={handleEmojiClick} 
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            😴
          </span>
        </h1>

        {!alarm && <p className="subtitle">Está na hora de tirar uma naninha.</p>}

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
                Manhã difícil
              </button>
              <button
                className={`btn btn-extra ${selectedExtras.some(e => e.id === 'ext2') ? 'selected' : ''}`}
                onClick={() => toggleExtra({ id: 'ext2', label: 'Aula muito chata', hours: 1 })}
              >
                Aula muito chata
              </button>
              <button
                className={`btn btn-extra ${selectedExtras.some(e => e.id === 'ext3') ? 'selected' : ''}`}
                onClick={() => toggleExtra({ id: 'ext3', label: 'Briguei', hours: 3 })}
              >
                Briguei
              </button>
            </div>

            <button className="btn-generate" onClick={handleGenerateTime}>
              MOMO, ATÉ QUE HORAS EU VOU MIMIR?
            </button>
          </div>
        )}

        {pendingAlarm && !alarm && (
          <div className="confirmation-area">
            <p className="highlight-text">
              O despertador vai tocar às <strong>{pendingAlarm.displayTime}</strong>
            </p>
            <div className="action-buttons">
              <button className="btn-confirm" onClick={confirmAlarm}>Ativar Alarme</button>
              <button className="btn-cancel" onClick={() => setPendingAlarm(null)}>Voltar</button>
            </div>
          </div>
        )}

        {alarm && (
          <div className="active-alarm-area">
            <div className="alarm-status">
              <span className="pulse-icon">🌙</span>
              <p>Shhh... Você já está dormindo até as <strong>{alarm.displayTime}</strong></p>
              
              <p key={messageIndex} className="cute-message">
                {cuteMessages[messageIndex]}
              </p>

              <p className="alarm-label">Motivos: {alarm.label}</p>
            </div>

            <div className="action-buttons-column">
              <button className={`btn-rain ${isRaining ? 'active' : ''}`} onClick={toggleRain}>
                {isRaining ? '🌧️ Desligar Chuva' : '🎧 Som de Chuva'}
              </button>
              <button className="btn-cancel-dark" onClick={cancelAlarm}>Acordei mais cedo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}