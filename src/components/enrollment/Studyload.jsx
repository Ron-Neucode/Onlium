const SUBJECTS = [
  { code:"CC 101", title:"Introduction to Computing", units:3, schedule:"Mon / Wed 7:30 - 9:00 AM" },
  { code:"CC 102", title:"Programming Fundamentals", units:3, schedule:"Mon / Wed / Fri 9:00 - 10:30 AM" },
  { code:"MATH 201", title:"Discrete Mathematics", units:3, schedule:"Mon / Wed 1:00 - 2:30 PM" },
  { code:"ENG 101", title:"Technical Writing", units:3, schedule:"Tue / Thu 7:30 - 9:00 AM" },
];

export default function Studyload() {
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:20 }}>
      <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, marginBottom:8 }}>Studyload</h3>
      <p style={{ color:'#64748b', marginTop:0 }}>Review the subjects and schedules for your enrolled term.</p>

      <div style={{ marginTop:16, borderRadius:8, border:'1px solid #e6eef9', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead style={{ background:'#f8fafc' }}>
            <tr>
              <th style={{ textAlign:'left', padding:12, fontSize:13, color:'#475569' }}>Code</th>
              <th style={{ textAlign:'left', padding:12, fontSize:13, color:'#475569' }}>Title</th>
              <th style={{ textAlign:'left', padding:12, fontSize:13, color:'#475569' }}>Units</th>
              <th style={{ textAlign:'left', padding:12, fontSize:13, color:'#475569' }}>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.map((s) => (
              <tr key={s.code} style={{ borderTop:'1px solid #f1f5f9' }}>
                <td style={{ padding:12, fontSize:14 }}>{s.code}</td>
                <td style={{ padding:12, fontSize:14 }}>{s.title}</td>
                <td style={{ padding:12, fontSize:14 }}>{s.units}</td>
                <td style={{ padding:12, fontSize:14, color:'#64748b' }}>{s.schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop:18, display:'flex', justifyContent:'flex-end' }}>
        <button style={{ padding:'10px 18px', borderRadius:8, background:'#2563eb', color:'#fff', border:'none', fontWeight:700 }}>Print Studyload</button>
      </div>
    </div>
  );
}
