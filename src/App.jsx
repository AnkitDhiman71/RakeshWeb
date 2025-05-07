import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FunctionsIcon from '@mui/icons-material/Functions';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ContactsIcon from '@mui/icons-material/Contacts';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  CardActions,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container
} from '@mui/material';
import { auth, ADMIN_EMAIL, addTimeSlot, getTimeSlots, deleteTimeSlot, getUserRole, setUserRole } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import StarBackground from './StarBackground';

// Hook to animate section on scroll
function useSectionAnimation() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setIsAdmin(user.email === ADMIN_EMAIL);
        const roleResult = await getUserRole(user.uid);
        if (roleResult.success) {
          setUserRole(roleResult.role);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setUserRole(null);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const roleResult = await getUserRole(result.user.uid);
      if (roleResult.success) {
        return { success: true, role: roleResult.role };
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message.replace('Firebase:', '').trim() 
      };
    }
  };

  const signup = async (email, password, role) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setUserRole(result.user.uid, role);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message.replace('Firebase:', '').trim() 
      };
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.slice(1);
      scrollToSection(sectionId);
    }
  }, [location]);

  return (
    <nav>
      <div className="nav-content">
        <Link to="/" className="nav-brand">
          <SchoolIcon /> Rakesh Kumar
        </Link>
        <IconButton
          sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#home" onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}>Home</a>
          {user && (
            <a href="#available-slots" onClick={(e) => {
              e.preventDefault();
              scrollToSection('available-slots');
            }}>Available Slots</a>
          )}
          <a href="#subjects" onClick={(e) => {
            e.preventDefault();
            scrollToSection('subjects');
          }}>Subjects</a>
          <a href="#contact" onClick={(e) => {
            e.preventDefault();
            scrollToSection('contact');
          }}>Contact Us</a>
          {user && isAdmin ? (
            <>
              <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                Admin
              </Link>
              <Link to="/" onClick={handleLogout}>Logout</Link>
            </>
          ) : user ? (
            <Link to="/" onClick={handleLogout}>Logout</Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const BookingModal = ({ open, onClose }) => {
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    class: '',
    dateTime: null
  });

  const handleChange = (name, value) => {
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Booking submitted:', bookingData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Book a Free Trial Class</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Name"
            value={bookingData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={bookingData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
          />
          <TextField
            label="Phone"
            value={bookingData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select
              value={bookingData.subject}
              label="Subject"
              onChange={(e) => handleChange('subject', e.target.value)}
            >
              <MenuItem value="mathematics">Mathematics</MenuItem>
              <MenuItem value="physics">Physics</MenuItem>
              <MenuItem value="chemistry">Chemistry</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select
              value={bookingData.class}
              label="Class"
              onChange={(e) => handleChange('class', e.target.value)}
            >
              {[8, 9, 10, 11, 12].map(classNum => (
                <MenuItem key={classNum} value={classNum}>
                  Class {classNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Preferred Date & Time"
              value={bookingData.dateTime}
              onChange={(newValue) => handleChange('dateTime', newValue)}
              disablePast
              minutesStep={30}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          sx={{ 
            background: 'linear-gradient(45deg, #2196F3, #64B5F6)',
            '&:hover': { opacity: 0.9 } 
          }}
        >
          Book Trial Class
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', mobile: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="contact-section" id="contact">
      <Box sx={{
        maxWidth: 500,
        mx: 'auto',
        my: 10, // Increased margin on y-axis
        p: 5,   // Increased padding
        background: '#1e1e1e',
        borderRadius: 3,
        boxShadow: 3,
      }}>
        <Typography variant="h4" fontWeight="bold" mb={3} color="white" align="center">
          Contact Us
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{ style: { color: '#fff' } }}
            InputProps={{ style: { color: '#fff', background: '#232323' } }}
          />
          <TextField
            label="Mobile Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{ style: { color: '#fff' } }}
            InputProps={{ style: { color: '#fff', background: '#232323' } }}
          />
          <TextField
            label="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            multiline
            rows={4}
            InputLabelProps={{ style: { color: '#fff' } }}
            InputProps={{ style: { color: '#fff', background: '#232323' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              background: 'linear-gradient(45deg, #2196F3, #64B5F6)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Send Message
          </Button>
        </form>
        {submitted && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Thank you for your message! We'll get back to you soon.
          </Alert>
        )}
      </Box>
    </section>
  );
};

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 10, // Increased margin-top for more space above footer
        px: { xs: 2, sm: 4, md: 6 }, // Responsive horizontal padding
        pb: 3, 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        pt: 6 // Increased padding-top for more space inside footer
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>About Us</Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
            Providing quality education since 2010. We specialize in Mathematics, Physics, and Chemistry
            for classes 8-12, helping students achieve academic excellence through personalized attention.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>Follow Us</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton 
              href="https://facebook.com" 
              target="_blank"
              sx={{ color: '#64B5F6' }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton 
              href="https://linkedin.com" 
              target="_blank"
              sx={{ color: '#64B5F6' }}
            >
              <LinkedInIcon />
            </IconButton>
            <IconButton 
              href="https://youtube.com" 
              target="_blank"
              sx={{ color: '#64B5F6' }}
            >
              <YouTubeIcon />
            </IconButton>
            <IconButton 
              href="https://instagram.com" 
              target="_blank"
              sx={{ color: '#64B5F6' }}
            >
              <InstagramIcon />
            </IconButton>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>Quick Links</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link 
              to="#home" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ color: '#64B5F6', textDecoration: 'none' }}
            >
              Home
            </Link>
            <Link 
              to="#subjects" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('subjects').scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ color: '#64B5F6', textDecoration: 'none' }}
            >
              Subjects
            </Link>
            <Link 
              to="#contact" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ color: '#64B5F6', textDecoration: 'none' }}
            >
              Contact
            </Link>
          </Box>
        </Grid>
      </Grid>
      <Typography 
        variant="body2" 
        align="center" 
        sx={{ 
          mt: 4, 
          pt: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.7)' 
        }}
      >
        © {new Date().getFullYear()} Rakesh Kumar Tutorials. All rights reserved.
      </Typography>
    </Box>
  );
};

const StudentDashboard = () => {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  
  return (
    <Paper sx={{ p: 3, mb: 3, background: '#1e1e1e' }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" /> Student Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ background: '#2d2d2d' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>My Progress</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Card sx={{ minWidth: 200, background: '#1e1e1e' }}>
                  <CardContent>
                    <Typography color="primary">Upcoming Classes</Typography>
                    <Typography variant="h4">3</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ minWidth: 200, background: '#1e1e1e' }}>
                  <CardContent>
                    <Typography color="primary">Completed Classes</Typography>
                    <Typography variant="h4">12</Typography>
                  </CardContent>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ background: '#2d2d2d' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Activities</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Mathematics Class" 
                    secondary="Completed on April 25, 2025" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Physics Class" 
                    secondary="Scheduled for April 29, 2025" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

const TeacherDashboard = () => {
  return (
    <Paper sx={{ p: 3, mb: 3, background: '#1e1e1e' }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" /> Teacher Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ background: '#2d2d2d' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Teaching Schedule</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Card sx={{ minWidth: 200, background: '#1e1e1e' }}>
                  <CardContent>
                    <Typography color="primary">Today's Classes</Typography>
                    <Typography variant="h4">4</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ minWidth: 200, background: '#1e1e1e' }}>
                  <CardContent>
                    <Typography color="primary">Total Students</Typography>
                    <Typography variant="h4">25</Typography>
                  </CardContent>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ background: '#2d2d2d' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Upcoming Classes</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Mathematics - Class 12" 
                    secondary="Today at 3:00 PM" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Physics - Class 11" 
                    secondary="Today at 5:00 PM" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

const Home = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const { user, userRole } = useAuth();

  // Section animation hooks
  const [heroRef, heroVisible] = useSectionAnimation();
  const [subjectsRef, subjectsVisible] = useSectionAnimation();
  const [contactRef, contactVisible] = useSectionAnimation();

  useEffect(() => {
    const loadTimeSlots = async () => {
      const slots = await getTimeSlots();
      setUpcomingClasses(slots);
    };
    loadTimeSlots();
  }, []);
  
  return (
    <div className="container">
      {/* Show role-specific dashboard for logged-in users */}
      {user && (
        <>
          {userRole === 'student' && <StudentDashboard />}
          {userRole === 'teacher' && <TeacherDashboard />}
        </>
      )}

      {/* Rest of the Home component remains unchanged */}
      <div id="home" className={`hero-section section-animate${heroVisible ? ' visible' : ''}`} ref={heroRef}>
        <h1>Welcome to Expert Tutoring</h1>
        <p className="hero-subtitle">Empowering students with personalized guidance in Mathematics, Physics, and Chemistry</p>
        <div className="hero-features">
          <div className="feature">
            <AccessTimeIcon sx={{ fontSize: 30, color: '#64B5F6' }} />
            <span>Flexible Timings</span>
          </div>
          <div className="feature">
            <SchoolIcon sx={{ fontSize: 30, color: '#64B5F6' }} />
            <span>Expert Guidance</span>
          </div>
        </div>
        <button className="cta-button" onClick={() => setIsBookingOpen(true)}>
          Book a Free Trial Class
        </button>
      </div>

      {user && (
        <div id="available-slots">
          <Paper sx={{ p: 3, mb: 3, background: '#1e1e1e' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon color="primary" /> Available Class Slots
            </Typography>
            <Grid container spacing={2}>
              {upcomingClasses.map((slot) => (
                <Grid item xs={12} sm={6} md={4} key={slot.id}>
                  <Card sx={{ background: '#2d2d2d' }}>
                    <CardContent>
                      <Typography color="primary" variant="h6" gutterBottom>
                        {slot.subject.charAt(0).toUpperCase() + slot.subject.slice(1)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {format(slot.startTime.toDate(), 'PPp')} - {format(slot.endTime.toDate(), 'p')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {slot.isOnline ? 'Online' : 'Offline'} Class
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </div>
      )}

      <div id="subjects" className={`subjects-section section-animate${subjectsVisible ? ' visible' : ''}`} ref={subjectsRef}>
        <h2>Subjects Offered</h2>
        <div className="subjects-grid">
          <div className="subject-card">
            <FunctionsIcon sx={{ fontSize: 40, color: '#64B5F6', marginBottom: '1rem' }} />
            <h3>Mathematics</h3>
            <p>Class 8-12</p>
            <ul>
              <li>Advanced Algebra</li>
              <li>Coordinate Geometry</li>
              <li>Calculus & Integration</li>
              <li>Trigonometry</li>
            </ul>
          </div>
          <div className="subject-card">
            <ScienceIcon sx={{ fontSize: 40, color: '#64B5F6', marginBottom: '1rem' }} />
            <h3>Physics</h3>
            <p>Class 8-12</p>
            <ul>
              <li>Classical Mechanics</li>
              <li>Electromagnetism</li>
              <li>Modern Physics</li>
              <li>Wave Optics</li>
            </ul>
          </div>
          <div className="subject-card">
            <CalculateIcon sx={{ fontSize: 40, color: '#64B5F6', marginBottom: '1rem' }} />
            <h3>Chemistry</h3>
            <p>Class 8-12</p>
            <ul>
              <li>Organic Chemistry</li>
              <li>Physical Chemistry</li>
              <li>Inorganic Chemistry</li>
              <li>Chemical Bonding</li>
            </ul>
          </div>
        </div>
      </div>

      <div id="contact" className={`contact-section section-animate${contactVisible ? ' visible' : ''}`} ref={contactRef}>
        <h2>Contact Information</h2>
        <div className="contact-grid">
          <div className="contact-item">
            <PhoneIcon sx={{ color: '#64B5F6' }} />
            <div>
              <h4>Phone</h4>
              <p>+91 9815503880</p>
              <small>Available Mon-Sat, 9AM-7PM</small>
            </div>
          </div>
          <div className="contact-item">
            <EmailIcon sx={{ color: '#64B5F6' }} />
            <div>
              <h4>Email</h4>
              <p>dhimanrakesh719@gmail.com</p>
              <small>Quick response within 24 hours</small>
            </div>
          </div>
          <div className="contact-item">
            <LocationOnIcon sx={{ color: '#64B5F6' }} />
            <div>
              <h4>Location</h4>
              <p>Dhiman Tutorial Complex</p>
              <small>Near City Center, Main Road</small>
            </div>
          </div>
        </div>
      </div>

      {user && <ContactForm />}

      <Footer />

      <BookingModal 
        open={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Optimistically sign in and redirect
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Redirect immediately based on email
      if (result.user.email === ADMIN_EMAIL) {
        navigate('/admin');
      } else {
        navigate('/');
      }
      // Now check the role in the background
      getUserRole(result.user.uid).then((roleResult) => {
        if (roleResult.success && roleResult.role !== selectedRole) {
          setError(`You are registered as a ${roleResult.role}. Please select the correct role.`);
          // Optionally, redirect back to login
          navigate('/login');
        }
      });
    } catch (error) {
      setError(error.message.replace('Firebase:', '').trim() || 'Failed to login');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="auth-error">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            label="Role"
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="email"
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          type="password"
          label="Password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          fullWidth
          sx={{
            background: 'linear-gradient(45deg, #2196F3, #64B5F6)',
            '&:hover': { opacity: 0.9 }
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      setLoading(false);
      return;
    }
    
    const result = await signup(email, password, selectedRole);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Failed to create account');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <div className="auth-error">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            label="Role"
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          type="email"
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          type="password"
          label="Password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          fullWidth
          sx={{
            background: 'linear-gradient(45deg, #2196F3, #64B5F6)',
            '&:hover': { opacity: 0.9 }
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  
  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

const AdminDashboard = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newSlot, setNewSlot] = useState({
    startTime: null,
    endTime: null,
    subject: '',
    maxStudents: 1,
    isOnline: true
  });
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const loadTimeSlots = async () => {
    const result = await getTimeSlots();
    if (result.success) {
      setTimeSlots(result.slots);
    } else {
      setError('Failed to load time slots');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const handleAddSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.subject) {
      setError('Please fill in all fields');
      return;
    }

    const result = await addTimeSlot(newSlot);
    if (result.success) {
      setIsAddingSlot(false);
      setNewSlot({
        startTime: null,
        endTime: null,
        subject: '',
        maxStudents: 1,
        isOnline: true
      });
      loadTimeSlots();
    } else {
      setError(result.error);
    }
  };

  const handleDeleteSlot = async (id) => {
    const result = await deleteTimeSlot(id);
    if (result.success) {
      loadTimeSlots();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container">
      <Typography variant="h4" sx={{ mb: 4 }}>Admin Dashboard</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Time Slots</Typography>
          <Button 
            variant="contained" 
            onClick={() => setIsAddingSlot(true)}
            startIcon={<AccessTimeIcon />}
          >
            Add Time Slot
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Dialog open={isAddingSlot} onClose={() => setIsAddingSlot(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Time Slot</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={newSlot.startTime}
                  onChange={(newValue) => setNewSlot(prev => ({ ...prev, startTime: newValue }))}
                  disablePast
                />
                <DateTimePicker
                  label="End Time"
                  value={newSlot.endTime}
                  onChange={(newValue) => setNewSlot(prev => ({ ...prev, endTime: newValue }))}
                  disablePast
                />
              </LocalizationProvider>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={newSlot.subject}
                  label="Subject"
                  onChange={(e) => setNewSlot(prev => ({ ...prev, subject: e.target.value }))}
                >
                  <MenuItem value="mathematics">Mathematics</MenuItem>
                  <MenuItem value="physics">Physics</MenuItem>
                  <MenuItem value="chemistry">Chemistry</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="number"
                label="Max Students"
                value={newSlot.maxStudents}
                onChange={(e) => setNewSlot(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newSlot.isOnline}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, isOnline: e.target.checked }))}
                  />
                }
                label="Online Class"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddingSlot(false)}>Cancel</Button>
            <Button onClick={handleAddSlot} variant="contained">Add Slot</Button>
          </DialogActions>
        </Dialog>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {timeSlots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} key={slot.id}>
                <Card>
                  <CardContent>
                    <Typography color="primary" variant="h6" gutterBottom>
                      {slot.subject.charAt(0).toUpperCase() + slot.subject.slice(1)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {format(slot.startTime.toDate(), 'PPp')} - {format(slot.endTime.toDate(), 'p')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {slot.isOnline ? 'Online' : 'Offline'} Class
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max Students: {slot.maxStudents}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </div>
  );
};

// Scroll progress bar component
function ScrollProgressBar() {
  const [scroll, setScroll] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScroll(scrolled);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="scroll-progress-bar-wrapper">
      <div className="scroll-progress-bar" style={{ width: `${scroll}%` }} />
    </div>
  );
}

function App() {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#2196F3',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StarBackground />
      <Router>
        <AuthProvider>
          <div className="app">
            <Navbar />
            <ScrollProgressBar />
            <Routes>
              <Route path="/" element={
                <Home />
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
