import { useState, useEffect } from "react";
import { services, therapists, auth } from "./api";

export default function App() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [serviceList, setServices] = useState([]);
  const [therapistList, setTherapists] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingRef, setBookingRef] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    if (token) checkAuth();
  }, [token]);

  async function loadData() {
    try {
      const [svcs, thrvs] = await Promise.all([services.list(), therapists.list()]);
      setServices(svcs);
      setTherapists(thrvs);
    } catch (e) {
      console.error("Load error:", e);
    }
  }

  async function checkAuth() {
    try {
      const userData = await auth.me(token);
      setUser(userData);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const { token: newToken, user: userData } = await auth.login({ email, password });
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      setView("admin");
    } catch (err) {
      alert("Login failed");
    }
  }

  async function handleBooking(e) {
    e.preventDefault();
    if (!selectedService || !selectedTherapist || !bookingDate || !bookingTime) {
      alert("Sila isi semua maklumat");
      return;
    }
    setLoading(true);
    try {
      const booking = await services.book({
        customerId: "demo-customer-id",
        customerName: bookingName,
        customerEmail: bookingEmail,
        therapistId: selectedTherapist,
        serviceId: selectedService,
        date: `${bookingDate}T${bookingTime}:00`
      });
      setBookingRef(booking.bookingRef);
      setView("success");
    } catch (err) {
      alert("Booking failed. Please try again.");
    }
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setView("home");
  }

  const styles = {
    container: { minHeight: "100vh" },
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 40px",
      background: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "var(--primary)", cursor: "pointer" },
    navLinks: { display: "flex", gap: "20px" },
    navBtn: { background: "none", border: "none", fontSize: "14px", color: "var(--text-light)", cursor: "pointer" },
    hero: {
      textAlign: "center",
      padding: "80px 20px",
      background: "linear-gradient(135deg, #F7F3EF 0%, #EDE8E2 100%)"
    },
    heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "48px", color: "var(--primary-dark)", marginBottom: "16px" },
    heroSub: { fontSize: "18px", color: "var(--text-light)", maxWidth: "600px", margin: "0 auto" },
    section: { padding: "60px 40px", maxWidth: "1200px", margin: "0 auto" },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "var(--text)", marginBottom: "30px", textAlign: "center" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: "24px" },
    card: {
      background: "white",
      borderRadius: "16px",
      padding: "28px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      transition: "transform 0.2s, box-shadow 0.2s"
    },
    cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: "20px", marginBottom: "8px" },
    cardPrice: { fontSize: "24px", fontWeight: "600", color: "var(--accent)" },
    cardDuration: { fontSize: "14px", color: "var(--text-light)", marginBottom: "16px" },
    btn: {
      background: "var(--primary)",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      transition: "background 0.2s"
    },
    btnOutline: {
      background: "transparent",
      color: "var(--primary)",
      border: "2px solid var(--primary)",
      padding: "10px 24px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer"
    },
    form: { maxWidth: "500px", margin: "0 auto", background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" },
    input: {
      width: "100%",
      padding: "14px 16px",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      fontSize: "14px",
      marginBottom: "16px",
      outline: "none"
    },
    select: {
      width: "100%",
      padding: "14px 16px",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      fontSize: "14px",
      marginBottom: "16px",
      background: "white"
    },
    label: { display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" },
    success: {
      textAlign: "center",
      padding: "60px 20px",
      background: "white",
      borderRadius: "16px",
      maxWidth: "500px",
      margin: "40px auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
    },
    successIcon: { fontSize: "64px", marginBottom: "20px" },
    successRef: {
      background: "var(--bg)",
      padding: "12px 24px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "18px",
      fontWeight: "600",
      color: "var(--primary)",
      margin: "20px 0"
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => setView("home")}>AHTAS PRO</div>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => setView("book")}>Book Now</button>
          {user ? (
            <>
              <button style={styles.navBtn} onClick={() => setView("admin")}>Dashboard</button>
              <button style={styles.navBtn} onClick={logout}>Logout</button>
            </>
          ) : (
            <button style={styles.navBtn} onClick={() => setView("login")}>Admin Login</button>
          )}
        </div>
      </nav>

      {view === "home" && (
        <>
          <div style={styles.hero}>
            <h1 style={styles.heroTitle}>Yot Therapy</h1>
            <p style={styles.heroSub}>Premium spa & wellness experience. Traditional Malaysian massage therapy for your body and soul.</p>
            <div style={{ marginTop: "30px" }}>
              <button style={styles.btn} onClick={() => setView("book")}>Book Your Session</button>
            </div>
          </div>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Our Services</h2>
            <div style={styles.grid}>
              {serviceList.map(s => (
                <div key={s.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{s.name}</h3>
                  <div style={styles.cardPrice}>RM {s.price}</div>
                  <div style={styles.cardDuration}>{s.duration} min</div>
                  <button style={styles.btnOutline} onClick={() => { setSelectedService(s.id); setView("book"); }}>
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...styles.section, background: "white", padding: "60px 40px" }}>
            <h2 style={styles.sectionTitle}>Our Therapists</h2>
            <div style={styles.grid}>
              {therapistList.map(t => (
                <div key={t.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{t.user.name}</h3>
                  <p style={{ color: "var(--text-light)", marginBottom: "12px" }}>Expert Therapist</p>
                  <p style={{ fontSize: "14px" }}>Commission: {(t.commission * 100)}%</p>
                  <p style={{ fontSize: "14px", color: "var(--accent)" }}>
                    {t.services.length} services available
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {view === "book" && (
        <section style={styles.section}>
          <h2 style={{ ...styles.sectionTitle, textAlign: "center" }}>Book Your Session</h2>
          
          {bookingRef ? (
            <div style={styles.success}>
              <div style={styles.successIcon}>✨</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Booking Confirmed!</h2>
              <p style={{ color: "var(--text-light)", marginTop: "10px" }}>Terima kasih atas tempahan anda</p>
              <div style={styles.successRef}>{bookingRef}</div>
              <button style={styles.btn} onClick={() => { setBookingRef(null); setView("home"); }}>
                Back to Home
              </button>
            </div>
          ) : (
            <form style={styles.form} onSubmit={handleBooking}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} type="text" value={bookingName} onChange={e => setBookingName(e.target.value)} placeholder="Nama penuh" required />

              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" value={bookingEmail} onChange={e => setBookingEmail(e.target.value)} placeholder="email@example.com" />

              <label style={styles.label}>Service</label>
              <select style={styles.select} value={selectedService || ""} onChange={e => setSelectedService(e.target.value)} required>
                <option value="">Select service...</option>
                {serviceList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - RM {s.price}</option>
                ))}
              </select>

              <label style={styles.label}>Therapist</label>
              <select style={styles.select} value={selectedTherapist || ""} onChange={e => setSelectedTherapist(e.target.value)} required>
                <option value="">Select therapist...</option>
                {therapistList.map(t => (
                  <option key={t.id} value={t.id}>{t.user.name}</option>
                ))}
              </select>

              <label style={styles.label}>Date</label>
              <input style={styles.input} type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />

              <label style={styles.label}>Time</label>
              <select style={styles.select} value={bookingTime} onChange={e => setBookingTime(e.target.value)} required>
                <option value="">Select time...</option>
                {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <button type="submit" style={{ ...styles.btn, width: "100%", marginTop: "10px" }} disabled={loading}>
                {loading ? "Processing..." : "Confirm Booking"}
              </button>
            </form>
          )}
        </section>
      )}

      {view === "login" && (
        <section style={styles.section}>
          <form style={styles.form} onSubmit={handleLogin}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "30px" }}>Admin Login</h2>
            <input style={styles.input} type="email" name="email" placeholder="Email" required />
            <input style={styles.input} type="password" name="password" placeholder="Password" required />
            <button type="submit" style={{ ...styles.btn, width: "100%" }}>Login</button>
          </form>
        </section>
      )}

      {view === "admin" && user && <AdminDashboard token={token} user={user} />}

      <footer style={{ textAlign: "center", padding: "40px", color: "var(--text-light)", fontSize: "14px" }}>
        <p>AHTAS PRO - Yot Therapy Spa Management System</p>
        <p style={{ marginTop: "8px" }}>© 2024 AHTAS. All rights reserved.</p>
      </footer>
    </div>
  );
}

function AdminDashboard({ token, user }) {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [dashData, appts] = await Promise.all([
        import("./api").then(m => m.admin.dashboard(token)),
        import("./api").then(m => m.appointments.list())
      ]);
      setStats(dashData);
      setAppointments(appts);
    } catch (e) {
      console.error("Dashboard load error:", e);
    }
    setLoading(false);
  }

  const styles = {
    container: { padding: "40px", maxWidth: "1400px", margin: "0 auto" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
    title: { fontFamily: "'Playfair Display', serif", fontSize: "32px" },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" },
    statCard: { background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
    statValue: { fontSize: "32px", fontWeight: "700", color: "var(--primary)" },
    statLabel: { fontSize: "14px", color: "var(--text-light)", marginTop: "4px" },
    table: { background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
    tableHeader: { background: "var(--bg)", padding: "16px 20px", fontWeight: "600", fontSize: "14px", textAlign: "left" },
    tableRow: { padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px" }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "60px" }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <div style={{ fontSize: "14px", color: "var(--text-light)" }}>Welcome, {user.name}</div>
      </div>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.stats.totalBookings || 0}</div>
          <div style={styles.statLabel}>Total Bookings</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>RM {stats?.stats.totalRevenue || 0}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.stats.therapistCount || 0}</div>
          <div style={styles.statLabel}>Therapists</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.stats.customerCount || 0}</div>
          <div style={styles.statLabel}>Customers</div>
        </div>
      </div>

      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", marginBottom: "20px" }}>Top Therapists</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {stats?.topTherapists.map(t => (
          <div key={t.id} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: "600" }}>{t.name}</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--accent)", marginTop: "8px" }}>
              RM {t.income}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-light)" }}>Total Income</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", marginBottom: "20px" }}>Recent Bookings</h2>
      <div style={styles.table}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1.5fr 1fr 1fr", padding: "16px 20px", background: "var(--bg)", fontWeight: "600", fontSize: "14px" }}>
          <div>Ref</div>
          <div>Customer</div>
          <div>Service</div>
          <div>Therapist</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        {appointments.map(a => (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1.5fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px", alignItems: "center" }}>
            <div style={{ fontFamily: "monospace", fontWeight: "500", color: "var(--primary)" }}>{a.bookingRef}</div>
            <div>{a.customer?.name || "N/A"}</div>
            <div>{a.service?.name}</div>
            <div>{a.therapist?.user?.name}</div>
            <div style={{ fontWeight: "600" }}>RM {a.totalAmount}</div>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", background: a.status === "CONFIRMED" ? "#C6F6D5" : "#FED7D7", color: a.status === "CONFIRMED" ? "#276749" : "#C53030" }}>
              {a.status}
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>No bookings yet</div>
        )}
      </div>
    </div>
  );
}
