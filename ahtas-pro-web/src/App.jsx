import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:4000";

export default function App() {
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    therapistId: "",
    date: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [servicesRes, therapistsRes] = await Promise.all([
        fetch(`${API_URL}/services`),
        fetch(`${API_URL}/therapists`)
      ]);

      const servicesData = await servicesRes.json();
      const therapistsData = await therapistsRes.json();

      setServices(servicesData);
      setTherapists(therapistsData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  }

  async function handleBooking(e) {
    e.preventDefault();

    if (!selectedService || !bookingForm.therapistId || !bookingForm.date) {
      alert("Please fill all fields");
      return;
    }

    try {
      // For demo: create a customer user first (in production, use auth)
      const customerRes = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingForm.name,
          email: bookingForm.email,
          role: "CUSTOMER"
        })
      });

      let customerId;
      if (customerRes.ok) {
        const customer = await customerRes.json();
        customerId = customer.id;
      } else {
        // Use a dummy ID for demo
        customerId = "demo-customer-id";
      }

      const bookingRes = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          therapistId: bookingForm.therapistId,
          serviceId: selectedService.id,
          date: bookingForm.date,
          email: bookingForm.email
        })
      });

      if (bookingRes.ok) {
        const booking = await bookingRes.json();
        alert(`Booking confirmed! Reference: ${booking.bookingRef}`);
        setSelectedService(null);
        setBookingForm({ name: "", email: "", therapistId: "", date: "" });
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading AHTAS PRO...</h2>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>AHTAS PRO</h1>
        <p>Premium Spa & Therapy Booking System</p>
      </header>

      {!selectedService ? (
        <div className="services-grid">
          <h2>Our Services</h2>
          <div className="grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <h3>{service.name}</h3>
                <div className="service-details">
                  <p className="price">RM {service.price}</p>
                  <p className="duration">{service.duration} minutes</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setSelectedService(service)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="booking-form-container">
          <button
            className="btn-back"
            onClick={() => setSelectedService(null)}
          >
            ← Back to Services
          </button>

          <div className="booking-form">
            <h2>Book: {selectedService.name}</h2>
            <p className="service-info">
              RM {selectedService.price} • {selectedService.duration} minutes
            </p>

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={bookingForm.name}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Therapist</label>
                <select
                  value={bookingForm.therapistId}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      therapistId: e.target.value
                    })
                  }
                  required
                >
                  <option value="">Choose a therapist...</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={bookingForm.date}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, date: e.target.value })
                  }
                  required
                />
              </div>

              <button type="submit" className="btn-primary btn-large">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
