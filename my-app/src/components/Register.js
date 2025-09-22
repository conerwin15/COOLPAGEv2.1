import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "PH", name: "Philippines" },
  { code: "UK", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "VN", name: "Vietnam" },
  { code: "SG", name: "Singapore" },
];

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#e0f4ff",
    padding: "30px 20px",
  },
  formBox: {
    background: "#fff",
    padding: "30px 40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "500px",
    textAlign: "center",
  },
  header: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    fontWeight: "bold",
    color: "#0077cc",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    padding: "10px 12px",
    marginTop: "16px",
    backgroundColor: "#0099ff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "0.85rem",
    marginBottom: "10px",
  },
  loginLink: {
    marginTop: "16px",
    fontSize: "0.9rem",
  },
};

const RegisterForm = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    profile_pic: null,
  });

  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (registrationSuccess) {
      if (typeof onRegisterSuccess === "function") {
        onRegisterSuccess();
      }
      navigate("/login");
    }
  }, [registrationSuccess, onRegisterSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const data = new FormData();
    data.append("username", formData.username);
    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("country", formData.country);
    if (formData.profile_pic) {
      data.append("profile_pic", formData.profile_pic);
    }
  const API_URL= process.env.REACT_APP_API_URL;
    try {
      const response = await axios.post(
        `${API_URL}/register.php`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

     if (response.data.success) {
  alert(response.data.message || "Registration successful!");
  setRegistrationSuccess(true);
  console.log('Success response:', response);
} else {
  console.log('Failure response:', response);
  setError(response.data.message || "Registration failed.");
}
    } catch (err) {
      console.error("Registration error:", err);
      if (err.message === "Network Error") {
        setError("Network error: Backend may not be running or blocked by CORS.");
      } else if (
        err.response?.data?.message?.includes("Duplicate entry") &&
        err.response?.data?.message?.includes("email")
      ) {
        setError("This email is already registered.");
      } else {
        setError(err.response?.data?.error || err.message);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={styles.header}>Create Account</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
<di  style={{ textAlign: 'left' }}><p>Upload profile picture:
          <input
            type="file"
        
            name="profile_pic"
            accept="image/*"
            onChange={handleChange}
            style={styles.input}
              
                    required
          />
</p></di>
          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#0077cc", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
