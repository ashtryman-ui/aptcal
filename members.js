// ─────────────────────────────────────────────────────────
//  공통 데이터 & 유틸리티 (members.txt 와 동기화 유지)
// ─────────────────────────────────────────────────────────

// ── 관리자 설정 ──────────────────────────────────────────
const ADMIN_PHONE    = '01086521173';
const ADMIN_PASSWORD = '0000';          // ← 필요 시 변경

// ── 조합원 명단 (members.txt 와 동일하게 유지) ──────────
// 2채 이상: 동일 name+phone, unit/type 다르게 여러 줄
const MEMBERS = [
  { name: '안수현', phone: '01012345678', type: '84A', unit: '111동 1601호' },
  { name: '홍길동', phone: '01098765432', type: '73A', unit: '112동 305호'  },
  { name: '김민준', phone: '01055556666', type: '59A', unit: '113동 502호'  },
  { name: '이영희', phone: '01077778888', type: '84B', unit: '114동 801호'  },
  { name: '이영희', phone: '01077778888', type: '59B', unit: '115동 401호'  },
  { name: '관리자', phone: '01086521173', type: '84A', unit: '101동 2501호' },
];

// ── 세션 ─────────────────────────────────────────────────
const _SK = 'aptcal_session';
function getSession()  { try { return JSON.parse(localStorage.getItem(_SK)); } catch { return null; } }
function setSession(d) { localStorage.setItem(_SK, JSON.stringify(d)); }
function clearSession(){ localStorage.removeItem(_SK); }
function requireSession(to = 'index.html') {
  const s = getSession();
  if (!s) { location.href = to; return null; }
  return s;
}

// ── 조합원 조회 ──────────────────────────────────────────
function getMemberUnits(name, phone) {
  return MEMBERS.filter(m => m.name === name && m.phone === phone);
}

// ── 계산기 데이터 저장/조회 ──────────────────────────────
function calcDataKey(unit) { return 'aptcal_data_' + unit; }
function getCalcData(unit) {
  try { return JSON.parse(localStorage.getItem(calcDataKey(unit))); } catch { return null; }
}
function setCalcData(unit, data) {
  localStorage.setItem(calcDataKey(unit), JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
}

// ── 로그인 로그 ──────────────────────────────────────────
const _LK = 'aptcal_logs';
function getLogs() { try { return JSON.parse(localStorage.getItem(_LK)) || []; } catch { return []; } }
function logLogin(name, phone, units) {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const logs  = getLogs();
  const idx   = logs.findIndex(l => l.date === today && l.phone === phone);
  if (idx >= 0) {
    logs[idx].count++;
    if (!logs[idx].times.includes(now)) logs[idx].times.push(now);
  } else {
    logs.unshift({ date: today, phone, name, units: units.map(u => u.unit), count: 1, times: [now] });
  }
  localStorage.setItem(_LK, JSON.stringify(logs));
}

// ── 숫자 포맷 ─────────────────────────────────────────────
function fmtWon(v) {
  if (!v && v !== 0) return '—';
  const a = Math.round(Math.abs(v)), s = v < 0 ? '-' : '';
  if (a >= 1e8) { const e = Math.floor(a/1e8), m = Math.round((a%1e8)/1e4); return s+(m>0?`${e}억 ${m.toLocaleString()}만원`:`${e}억원`); }
  if (a >= 1e4) return s + Math.round(a/1e4).toLocaleString() + '만원';
  return s + a.toLocaleString() + '원';
}

// ── 전화번호 마스킹 ───────────────────────────────────────
function maskPhone(p) {
  const d = p.replace(/\D/g, '');
  if (d.length >= 11) return `${d.slice(0,3)}-****-${d.slice(-4)}`;
  return p;
}
