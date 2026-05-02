import { useState, useEffect, useRef } from 'react';
import './App.css';

interface AlarmData {
  targetTime: string;
  startTime: string;
  label: string;
  displayTime: string;
}

interface MoodEntry {
  date: string;
  mood: string;
  label: string;
}

const soundLibrary = {
  chuva: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
  lareira: 'https://actions.google.com/sounds/v1/ambiences/fireplace_crackling.ogg',
  floresta: 'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg'
};

export default function App() {
  const [alarm, setAlarm] = useState<AlarmData | null>(null);
  const [pendingAlarm, setPendingAlarm] = useState<boolean>(false);
  const [selectedBase, setSelectedBase] = useState({ id: '', label: '', hours: 0 });
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(100);
  
  const [activeSounds, setActiveSounds] = useState<{ [key: string]: boolean }>({ chuva: false, lareira: false, floresta: false });
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({ chuva: 0.5, lareira: 0.5, floresta: 0.5 });
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const [weeklyCount, setWeeklyCount] = useState(0);
  const [showMood, setShowMood] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('momo_naninha');
    if (saved) setAlarm(JSON.parse(saved));
    updateStats();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (localStorage.getItem('momo_naninha')) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!alarm) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(alarm.startTime).getTime();
      const end = new Date(alarm.targetTime).getTime();
      const total = end - start;
      const remaining = end - now;

      if (remaining <= 0) {
        setAlarm(null);
        localStorage.removeItem('momo_naninha');
        setShowMood(true);
      } else {
        const perc = (remaining / total) * 100;
        setProgress(perc);
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alarm]);

  const updateStats = () => {
    const history = JSON.parse(localStorage.getItem('momo_history') || '[]');
    const weekAgo = Date.now() - 604800000;
    const recent = history.filter((t: number) => t > weekAgo);
    setWeeklyCount(recent.length);
  };

  const toggleSound = (key: string) => {
    if (!audioRefs.current[key]) {
      audioRefs.current[key] = new Audio((soundLibrary as any)[key]);
      audioRefs.current[key].loop = true;
    }

    if (activeSounds[key]) {
      audioRefs.current[key].pause();
    } else {
      audioRefs.current[key].volume = volumes[key];
      audioRefs.current[key].play();
    }
    setActiveSounds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVolumeChange = (key: string, val: number) => {
    setVolumes(prev => ({ ...prev, [key]: val }));
    if (audioRefs.current[key]) {
      audioRefs.current[key].volume = val;
    }
  };

  const saveMood = (emoji: string, label: string) => {
    const moodHistory = JSON.parse(localStorage.getItem('momo_mood_history') || '[]');
    const entry: MoodEntry = { date: new Date().toISOString(), mood: emoji, label: label };
    moodHistory.push(entry);
    localStorage.setItem('momo_mood_history', JSON.stringify(moodHistory));
    setShowMood(false);
  };

  const startAlarm = () => {
    const now = new Date();
    const target = new Date(now.getTime() + selectedBase.hours * 3600000);
    const newAlarm = {
      startTime: now.toISOString(),
      targetTime: target.toISOString(),
      label: selectedBase.label,
      displayTime: target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAlarm(newAlarm);
    localStorage.setItem('momo_naninha', JSON.stringify(newAlarm));
    const history = JSON.parse(localStorage.getItem('momo_history') || '[]');
    history.push(Date.now());
    localStorage.setItem('momo_history', JSON.stringify(history));
    updateStats();
    setPendingAlarm(false);
  };

  return (
    <div className="container">
      <div className="card">
        {!alarm && !showMood && (
          <div className="setup-screen">
            <div className="badge">Dormiu {weeklyCount}x essa semana ✨</div>
            <h1>Oii Momo! 😴</h1>
            <p className="subtitle">Como está o seu soninho hoje?</p>
            <div className="options-grid">
              <button className={`opt-btn ${selectedBase.id === '1' ? 'active' : ''}`} onClick={() => setSelectedBase({ id: '1', label: 'Tô Soninho', hours: 3 })}>Tô Soninho</button>
              <button className={`opt-btn ${selectedBase.id === '2' ? 'active' : ''}`} onClick={() => setSelectedBase({ id: '2', label: 'Pouco Soninho', hours: 2.5 })}>Pouco Soninho</button>
              <button className={`opt-btn ${selectedBase.id === '3' ? 'active' : ''}`} onClick={() => setSelectedBase({ id: '3', label: 'Descanso', hours: 2 })}>Apenas Descansar</button>
            </div>
            <button className="main-btn" onClick={() => setPendingAlarm(true)} disabled={!selectedBase.id}>Momo, até que horas vou mimir?</button>
          </div>
        )}

        {pendingAlarm && !alarm && (
          <div className="modal-confirm">
            <div className="modal-content">
              <h2>Confirmar Alarme</h2>
              <p>Você vai acordar às <strong>{new Date(Date.now() + selectedBase.hours * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></p>
              <div className="modal-actions">
                <button className="confirm-btn" onClick={startAlarm}>Ativar Alarme</button>
                <button className="cancel-btn" onClick={() => setPendingAlarm(false)}>Voltar</button>
              </div>
            </div>
          </div>
        )}

        {alarm && (
          <div className="sleep-screen">
            <div className="progress-container">
              <svg width="220" height="220">
                <circle className="circle-bg" cx="110" cy="110" r="100" />
                <circle className="circle-bar" cx="110" cy="110" r="100" style={{ strokeDashoffset: 628 - (628 * progress) / 100 }} />
              </svg>
              <div className="time-display">
                <span className="time-remaining">{timeLeft}</span>
                <span className="time-target">até {alarm.displayTime}</span>
              </div>
            </div>
            <div className="sound-mixer">
              {Object.keys(soundLibrary).map((s) => (
                <div key={s} className="mixer-item">
                  <button className={`sound-toggle ${activeSounds[s] ? 'on' : ''}`} onClick={() => toggleSound(s)}>
                    {s === 'chuva' ? '🌧️' : s === 'lareira' ? '🔥' : '🌲'}
                  </button>
                  <input type="range" min="0" max="1" step="0.1" value={volumes[s]} onChange={(e) => handleVolumeChange(s, parseFloat(e.target.value))} />
                </div>
              ))}
            </div>
            <button className="wakeup-btn" onClick={() => { setAlarm(null); localStorage.removeItem('momo_naninha'); setShowMood(true); }}>Acordei mais cedo</button>
          </div>
        )}

        {showMood && (
          <div className="mood-screen">
            <h2>Como você acordou?</h2>
            <div className="mood-options">
              <button onClick={() => saveMood('😊', 'Renovada')}>😊<br/><span>Renovada</span></button>
              <button onClick={() => saveMood('😴', 'Com sono')}>😴<br/><span>Com sono</span></button>
              <button onClick={() => saveMood('😵‍💫', 'Exausta')}>😵‍💫<br/><span>Exausta</span></button>
              <button onClick={() => saveMood('💖', 'Amada')}>💖<br/><span>Amada</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}