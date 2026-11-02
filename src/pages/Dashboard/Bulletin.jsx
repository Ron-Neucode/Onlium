import { useState, useEffect } from "react";
import { apiService } from "../../services/apiService.js";
import "./styles/Bulletin.css";

export default function Bulletin() {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBulletins();
  }, []);

  const loadBulletins = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBulletins();
      setBulletins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-title">Bulletin</div>
        <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-title">Bulletin</div>
        <div style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Bulletin</div>
      {bulletins.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
          No bulletins available
        </div>
      ) : (
        bulletins.map((item) => (
          <div className="bulletin-item" key={item.id}>
            {item.title}
          </div>
        ))
      )}
    </div>
  );
}