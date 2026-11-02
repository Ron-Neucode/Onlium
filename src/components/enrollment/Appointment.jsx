import { useState } from "react";

const SLOTS = [
  { id: 's1', label: 'May 5, 2026 — 10:00 AM' },
  { id: 's2', label: 'May 6, 2026 — 2:00 PM' },
  { id: 's3', label: 'May 7, 2026 — 9:00 AM' },
];

export default function Appointment({ onConfirm }) {
  const [selected, setSelected] = useState(null);
  const handleConfirm = () => {
    if (!selected) return;
    if (onConfirm) onConfirm(selected);
    else alert(`Appointment confirmed: ${selected}`);
  };

  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:20 }}>
      <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, marginBottom:6 }}>Appointment</h3>
      <p style={{ color:'#64748b', marginTop:0 }}>Choose an appointment slot for payment or document submission.</p>

      <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10 }}>
        {SLOTS.map(s => (
          <label key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:12, borderRadius:8, border:'1px solid #eef2f7', background:selected === s.label ? '#eff6ff' : '#fff', cursor:'pointer' }}>
            <input type="radio" name="slot" value={s.label} checked={selected === s.label} onChange={() => setSelected(s.label)} />
            <div>
              <div style={{ fontSize:14, fontWeight:700 }}>{s.label}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>Cashier window available</div>
            </div>
          </label>
        ))}
      </div>

      <div style={{ marginTop:18, display:'flex', justifyContent:'flex-end' }}>
        <button onClick={handleConfirm} disabled={!selected} style={{ padding:'10px 18px', borderRadius:8, background: selected ? '#2563eb' : '#cbd5e1', color: selected ? '#fff' : '#94a3b8', border:'none', fontWeight:700, cursor: selected ? 'pointer' : 'not-allowed' }}>Confirm appointment</button>
      </div>
    </div>
  );
}
