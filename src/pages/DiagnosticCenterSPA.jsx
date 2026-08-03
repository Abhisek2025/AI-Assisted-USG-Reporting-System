// src/pages/DiagnosticCenterSPA.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Award,
  Activity,
  ShieldCheck,
  FileText,
  Sparkles,
  ChevronRight,
  Send,
  UserCheck,
  ArrowRight,
  Info,
  CalendarCheck,
  Heart,
  Droplet,
  Building2,
  Users,
  Gift,
  Share2,
  X,
  Eye,
  Check,
  LogIn
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function DiagnosticCenterSPA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); // home | services | doctors | camps | book | contact
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Hospital Image Preview Lightbox Modal State
  const [previewImage, setPreviewImage] = useState(null);

  // Booking Form State
  const [selectedService, setSelectedService] = useState('3D/4D Obstetric Fetal Anomaly Scan');
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Female');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [referringDoctor, setReferringDoctor] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Donation Camp Registration State
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorAge, setDonorAge] = useState('');
  const [donorBloodGroup, setDonorBloodGroup] = useState('O+');
  const [donorCamp, setDonorCamp] = useState('Annual Mega Blood Donation Drive');
  const [donorType, setDonorType] = useState('Blood Donation');
  const [donorNotes, setDonorNotes] = useState('');
  const [donorSubmitting, setDonorSubmitting] = useState(false);
  const [donorSuccess, setDonorSuccess] = useState(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // Hospital Photos Data
  const hospitalPhotos = [
    {
      id: 'img-1',
      title: 'Apex Hospital Main Building',
      category: 'Exterior & Architecture',
      subtitle: '8-Story Multi-Specialty & Advanced Diagnostic Center',
      src: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
      description: 'Modern glass-facade hospital building with 24x7 emergency entrance, ample ambulance parking, and NABL-accredited diagnostic wings.'
    },
    {
      id: 'img-2',
      title: '4D USG Diagnostic Suite',
      category: 'Ultrasound Dept',
      subtitle: 'GE Voluson E10 & Philips EPIQ Elite Workstation',
      src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      description: 'Sterile, temperature-controlled ultrasound rooms equipped with high-resolution HD live monitors and patient comfort beds.'
    },
    {
      id: 'img-3',
      title: 'Patient Reception & Waiting Lounge',
      category: 'OPD Lounge',
      subtitle: 'Air-conditioned OPD Waiting Lounge with Helpdesk',
      src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      description: 'Spacious patient waiting hall with real-time token status screens, refreshment kiosk, and dedicated senior citizen support.'
    },
    {
      id: 'img-4',
      title: '24/7 Emergency & ICU Diagnostic Response',
      category: 'Emergency Wing',
      subtitle: 'Round-the-clock Doppler & Bedside USG Service',
      src: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      description: 'Emergency response room equipped with portable bedside ultrasound for critical trauma, cardiac, and acute abdominal emergencies.'
    }
  ];

  // Donation Camps Data
  const donationCampsList = [
    {
      id: 'camp-1',
      title: 'Annual Mega Blood Donation Drive & Health Checkup',
      organizer: 'Apex Hospital & Central Red Cross Blood Bank',
      date: 'Saturday, 15th August 2026',
      time: '09:00 AM – 05:00 PM',
      venue: 'Apex Hospital Main Auditorium & Mobile Blood Collection Bus',
      image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=80',
      perks: [
        'Free Hemoglobin & USG Fatty Liver Screening Voucher',
        'Official Government Donor Certificate & Donor Card',
        'High-Protein Nutritional Refreshment Box',
        'Free Emergency Blood Unit Token for Family'
      ],
      description: 'Join our annual mega blood donation drive to help save lives of critical surgical, trauma, and thalassemia patients across the region.'
    },
    {
      id: 'camp-2',
      title: 'Organ & Tissue Donation Pledge Campaign',
      organizer: 'Apex Medical Foundation & NOTTO NGO',
      date: 'Every Wednesday & Saturday',
      time: '10:00 AM – 03:00 PM',
      venue: 'OPD Block A - Special Counseling Counter 4',
      image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1000&q=80',
      perks: [
        'Pledge Corneal, Kidney, Heart & Tissue Donation',
        'Official National Organ Donor Registration Card',
        'Detailed Family Counseling & Legal Consent Guidance',
        'Commemorative Donor Lapel Pin & Healthcare Privilege Card'
      ],
      description: 'Pledge to gift life after life. Our organ donation campaign provides transparent guidance and official donor cards to registered donors.'
    },
    {
      id: 'camp-3',
      title: 'Free Rural Maternal & Fetal Health USG Camp',
      organizer: 'Apex Fetal Medicine CSR Initiative',
      date: '1st & 15th of Every Month',
      time: '08:30 AM – 02:00 PM',
      venue: 'Suburban Outreach Clinic & Mobile USG Van',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
      perks: [
        'Free 3D Fetal Anomaly Ultrasound for Expectant Mothers',
        'Iron & Calcium Supplement Distribution',
        'High-Risk Pregnancy Radiologist Consultation',
        'Free Ambulance Pick-up for High-Risk Cases'
      ],
      description: 'Dedicated maternal wellness camp offering complimentary high-resolution fetal ultrasound scans for underprivileged pregnant women.'
    }
  ];

  const servicesList = [
    {
      id: 'usg-1',
      title: '3D/4D Obstetric Fetal Anomaly Scan',
      category: 'Fetal Medicine',
      description: 'High-resolution 4D volumetric imaging of fetal anatomy, facial features, nuchal translucency (NT), and Doppler cord evaluation.',
      duration: '30 Mins',
      price: '₹2,500',
      prep: 'Drink 3-4 glasses of water 1 hour before scan (Full Bladder required for early weeks).',
      machine: 'GE Voluson E10 Expert HD'
    },
    {
      id: 'usg-2',
      title: 'Abdominal & Pelvic Ultrasound Scan',
      category: 'General Abdomen',
      description: 'Comprehensive evaluation of liver, gallbladder, pancreas, spleen, kidneys, urinary bladder, uterus, and ovaries.',
      duration: '20 Mins',
      price: '₹1,800',
      prep: '6-8 Hours Strict Fasting for upper abdomen. Full bladder for pelvic scan.',
      machine: 'Philips EPIQ Elite Ultra'
    },
    {
      id: 'usg-3',
      title: 'Color Doppler Vascular Study',
      category: 'Vascular Diagnostics',
      description: 'Arterial and venous Doppler of upper/lower limbs, carotid duplex, renal artery Doppler, and DVT screening.',
      duration: '45 Mins',
      price: '₹3,000',
      prep: 'No special prep required for limbs. 4-hour fasting for Renal Doppler.',
      machine: 'Siemens Acuson Sequoia'
    },
    {
      id: 'usg-4',
      title: 'Fetal Echocardiography',
      category: 'Pediatric & Cardiac',
      description: 'Targeted ultrasound evaluation of 4-chamber fetal cardiac structure, outflow tracts, and ductal arches by fetal specialists.',
      duration: '35 Mins',
      price: '₹3,200',
      prep: 'Perform between 18-24 weeks of gestation. Bring previous anomaly report.',
      machine: 'GE Voluson E10 Expert HD'
    },
    {
      id: 'usg-5',
      title: 'Transvaginal Ultrasound (TVS)',
      category: 'Gynecological',
      description: 'High-frequency endovaginal probe scan for early pregnancy confirmation, ectopic exclusion, endometrial thickness & follicular tracking.',
      duration: '20 Mins',
      price: '₹1,900',
      prep: 'Empty bladder completely before the procedure.',
      machine: 'Philips EPIQ Elite Ultra'
    },
    {
      id: 'usg-6',
      title: 'Small Parts & Thyroid USG',
      category: 'Endocrine & Small Parts',
      description: 'High-frequency superficial organ screening including Thyroid TIRADS scoring, Scrotal Doppler, and Breast BIRADS imaging.',
      duration: '20 Mins',
      price: '₹1,600',
      prep: 'No special preparation needed. Wear comfortable open-neck clothing.',
      machine: 'Siemens Acuson Sequoia'
    },
    {
      id: 'usg-7',
      title: 'Musculoskeletal (MSK) Ultrasound',
      category: 'Orthopedic & Joint',
      description: 'Real-time joint dynamic examination for shoulder rotator cuff tears, Achilles tendonitis, ligament sprains, and soft tissue masses.',
      duration: '30 Mins',
      price: '₹2,200',
      prep: 'Wear loose clothing allowing access to examined joint.',
      machine: 'Philips EPIQ Elite Ultra'
    }
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/appointments/doctors');
      const data = await res.json();
      if (data.success && data.data) {
        setDoctors(data.data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      toast.error('Please enter patient name and contact phone number.');
      return;
    }

    const docObj = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
    const docName = docObj ? docObj.name : 'Dr. Ananya Sharma';

    setBookingSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName.trim(),
          age: patientAge,
          gender: patientGender,
          phone: patientPhone.trim(),
          email: patientEmail.trim(),
          doctor_id: selectedDoctorId,
          doctor_name: docName,
          usg_service: selectedService,
          appointment_date: bookingDate,
          slot_time: selectedSlot,
          symptoms: clinicalNotes.trim() || `Ref: ${referringDoctor || 'Self'}`
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.data);
        toast.success('USG Appointment booked successfully!');
      } else {
        toast.error(data.message || 'Failed to book appointment.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Server error while booking appointment.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleDonorSubmit = (e) => {
    e.preventDefault();
    if (!donorName.trim() || !donorPhone.trim()) {
      toast.error('Please enter your full name and contact phone number.');
      return;
    }

    setDonorSubmitting(true);
    setTimeout(() => {
      const refCode = `DONOR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const donorRecord = {
        donor_id: refCode,
        name: donorName.trim(),
        phone: donorPhone.trim(),
        email: donorEmail.trim(),
        age: donorAge || '25',
        blood_group: donorBloodGroup,
        camp: donorCamp,
        type: donorType,
        registered_at: new Date().toLocaleString()
      };
      setDonorSuccess(donorRecord);
      setDonorSubmitting(false);
      toast.success(`🎉 Thank you for registering! Donor ID: ${refCode}`);
    }, 600);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error('Please fill in your name and phone number.');
      return;
    }
    toast.success('Thank you for contacting Apex Diagnostic Center! Our representative will call you shortly.');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactMsg('');
  };

  const selectedDoctorObj = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">APEX HOSPITAL</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80 uppercase tracking-wider">USG & Diagnostics</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Multi-Specialty Hospital & Advanced Ultrasound Center</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              USG Services
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'doctors'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              Doctor Schedule
            </button>
            <button
              onClick={() => setActiveTab('camps')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'camps'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-800 hover:bg-rose-50'
              }`}
            >
              <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600/20" />
              <span>Donation Camps</span>
            </button>
            <button
              onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'book'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:text-purple-800 hover:bg-purple-50'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'contact'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              Contact Us
            </button>
          </nav>

          {/* Login / Portal Link */}
          <div className="flex items-center space-x-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Staff Portal ({user.role_name})</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Employee Login</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1">

        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-16 pb-16">
            
            {/* Hero Section with Hospital Photo Showcase */}
            <section className="relative overflow-hidden pt-8 pb-16 bg-gradient-to-b from-blue-50/80 via-indigo-50/30 to-slate-50 border-b border-slate-200/80">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  
                  {/* Left Column: Hero Text */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100/80 border border-blue-200/80 rounded-full text-blue-700 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>NABL Accredited • AI-Powered 4D USG & Diagnostic Hospital</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                      Apex Hospital & <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                        Advanced Diagnostic Center
                      </span>
                    </h1>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      State-of-the-art 8-story healthcare facility featuring GE Voluson 4D Obstetric Ultrasound suites, high-precision Color Doppler, 24/7 ICU & Emergency care, and regular Blood & Organ Donation Camps for the community.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
                        className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2"
                      >
                        <CalendarCheck className="w-5 h-5" />
                        <span>Book USG Appointment</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('camps')}
                        className="px-6 py-3.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center space-x-2 shadow-xs"
                      >
                        <Droplet className="w-5 h-5 text-rose-600 fill-rose-600/20" />
                        <span>Donation Camps Register</span>
                      </button>
                    </div>

                    {/* Quick Hospital Highlights */}
                    <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200">
                      <div>
                        <p className="text-2xl font-black text-slate-900">100+ Bed</p>
                        <p className="text-xs text-slate-500 font-medium">Hospital Capacity</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-blue-600">18,500+</p>
                        <p className="text-xs text-slate-500 font-medium">USG Scans Done</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-rose-600">2,400+</p>
                        <p className="text-xs text-slate-500 font-medium">Blood Donors Served</p>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Featured Hospital Picture Card */}
                  <div className="lg:col-span-6">
                    <div className="relative group rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl bg-white">
                      <img
                        src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80"
                        alt="Apex Hospital Main Facade"
                        referrerPolicy="no-referrer"
                        className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full shadow-md">
                          Apex Hospital Main Facade
                        </span>
                        <span className="px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-full shadow-md">
                          24/7 Emergency Active
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
                              <Building2 className="w-4 h-4 text-blue-600" />
                              <span>Apex Hospital & Radiodiagnosis Wing</span>
                            </h3>
                            <p className="text-xs text-slate-600 mt-0.5">Sector 4, Medical Hub • NABL & ISO 9001:2026 Certified</p>
                          </div>
                          <button
                            onClick={() => setPreviewImage(hospitalPhotos[0])}
                            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all shadow-xs"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View Large</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* SECTION 2: HOSPITAL INFRASTRUCTURE & GALLERY */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold mb-1">
                    <Building2 className="w-4 h-4" />
                    <span>HOSPITAL TOUR & INFRASTRUCTURE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Apex Hospital & Diagnostic Facility Showcase</h2>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">
                    Explore our modern multi-specialty hospital infrastructure, advanced GE Voluson USG suites, and patient care lounges.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {hospitalPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setPreviewImage(photo)}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md">
                          <Eye className="w-4 h-4" />
                          <span>Click to Expand</span>
                        </span>
                      </div>
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 bg-white/90 text-blue-700 rounded-md border border-slate-200 shadow-2xs">
                        {photo.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-1">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{photo.title}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{photo.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 3: DONATION CAMPS & COMMUNITY HEALTH DRIVES */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="bg-gradient-to-br from-rose-50 via-red-50/40 to-slate-50 border border-rose-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-rose-200 pb-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-100/90 text-rose-800 rounded-full border border-rose-200 text-xs font-bold">
                      <Droplet className="w-4 h-4 text-rose-600 fill-rose-600/20" />
                      <span>COMMUNITY HEALTH & DONATION CAMPS</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
                      Blood & Organ Donation Camp Arrangements
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                      Apex Hospital organizes regular life-saving Blood Donation drives, Organ Pledge awareness camps, and free rural maternal health USG checkups. Register online to donate or sponsor a camp.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('camps')}
                    className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center space-x-2 shrink-0"
                  >
                    <Heart className="w-5 h-5 fill-white" />
                    <span>Register as Donor Now</span>
                  </button>
                </div>

                {/* Camp Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {donationCampsList.map((camp) => (
                    <div key={camp.id} className="bg-white border border-rose-100 rounded-2xl overflow-hidden hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 p-5 shadow-xs">
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden h-40">
                          <img
                            src={camp.image}
                            alt={camp.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-md uppercase shadow-2xs">
                            Upcoming Camp
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">{camp.title}</h3>
                        
                        <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                          <p className="flex items-center space-x-2 text-rose-700 font-bold">
                            <Calendar className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{camp.date} ({camp.time})</span>
                          </p>
                          <p className="flex items-start space-x-2 text-slate-600">
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                            <span>{camp.venue}</span>
                          </p>
                        </div>

                        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-[11px] space-y-1.5">
                          <p className="text-rose-900 font-bold">Donor Privileges & Benefits:</p>
                          <ul className="space-y-1 text-slate-700">
                            {camp.perks.slice(0, 3).map((perk, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setDonorCamp(camp.title);
                          setActiveTab('camps');
                        }}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                        <span>Participate in this Camp</span>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* Quick Services Preview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-3 mb-12">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Our Specialized USG Services</h2>
                <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
                  High-precision ultrasound scanning conducted on premium GE & Philips machines by MD Radiologists.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {servicesList.slice(0, 3).map((svc) => (
                  <div key={svc.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-md transition-all space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">{svc.category}</span>
                      <span className="text-sm font-black text-emerald-600">{svc.price}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{svc.title}</h3>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{svc.description}</p>
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-600 font-medium border-t border-slate-100">
                      <span>⏱️ {svc.duration}</span>
                      <button
                        onClick={() => {
                          setSelectedService(svc.title);
                          setActiveTab('book');
                          setBookingSuccess(null);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
                      >
                        <span>Book Scan</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setActiveTab('services')}
                  className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl transition-all shadow-2xs"
                >
                  Explore All USG Scans & Preparation Instructions →
                </button>
              </div>
            </section>

          </div>
        )}

        {/* TAB: DONATION CAMPS PAGE */}
        {activeTab === 'camps' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            
            {/* Header */}
            <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-100 text-rose-800 rounded-full border border-rose-200 text-xs font-bold mb-2">
                  <Droplet className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>APEX CSR & SOCIAL RESPONSIBILITY</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900">Donation Camp Arrangements & Registration</h1>
                <p className="text-slate-600 text-xs sm:text-sm mt-1">
                  Participate in blood donation drives, organ pledge campaigns, and community health camps organized by Apex Hospital.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
                  <p className="text-lg font-black text-rose-600">2,400+</p>
                  <p className="text-[10px] text-slate-500">Blood Units Donated</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
                  <p className="text-lg font-black text-emerald-600">350+</p>
                  <p className="text-[10px] text-slate-500">Organ Donors Pledged</p>
                </div>
              </div>
            </div>

            {/* Donation Camps Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: List of Camps */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  <span>Scheduled Donation Drives & Health Camps</span>
                </h2>

                <div className="space-y-6">
                  {donationCampsList.map((camp) => (
                    <div key={camp.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-rose-300 hover:shadow-md transition-all shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                            {camp.organizer}
                          </span>
                          <h3 className="text-base font-extrabold text-slate-900">{camp.title}</h3>
                        </div>
                        <button
                          onClick={() => setDonorCamp(camp.title)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all self-start sm:self-center shrink-0 shadow-2xs"
                        >
                          Select Camp
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{camp.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                          <p className="text-slate-500 font-semibold text-[10px]">DATE & TIME:</p>
                          <p className="text-rose-700 font-bold">{camp.date}</p>
                          <p className="text-slate-600 text-[11px]">{camp.time}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-semibold text-[10px]">VENUE LOCATION:</p>
                          <p className="text-slate-900 font-medium text-[11px]">{camp.venue}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-500">Included Donor Privileges:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700">
                          {camp.perks.map((p, i) => (
                            <div key={i} className="flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Donor Online Registration Form */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
                  
                  {donorSuccess ? (
                    <div className="space-y-6 text-center">
                      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
                        <Heart className="w-10 h-10 fill-rose-600" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900">Donor Registration Successful!</h3>
                        <p className="text-xs text-slate-600">
                          Thank you for stepping forward to save lives with Apex Hospital.
                        </p>
                      </div>

                      <div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-200 text-left font-mono text-xs space-y-2 text-slate-800">
                        <div className="flex justify-between border-b border-rose-200 pb-1.5">
                          <span className="text-slate-500">Donor Reg ID:</span>
                          <span className="text-rose-700 font-bold">{donorSuccess.donor_id}</span>
                        </div>
                        <div className="flex justify-between border-b border-rose-200 pb-1.5">
                          <span className="text-slate-500">Donor Name:</span>
                          <span className="text-slate-900 font-bold">{donorSuccess.name} ({donorSuccess.age} yrs)</span>
                        </div>
                        <div className="flex justify-between border-b border-rose-200 pb-1.5">
                          <span className="text-slate-500">Blood Group:</span>
                          <span className="text-emerald-700 font-bold">{donorSuccess.blood_group}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Selected Camp:</span>
                          <span className="text-blue-700 font-bold text-[11px] truncate max-w-[180px]">{donorSuccess.camp}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-amber-800 font-medium bg-amber-50 p-3 rounded-xl border border-amber-200">
                         Please bring a photo ID card and arrive 15 minutes before slot time. Stay hydrated!
                      </p>

                      <button
                        onClick={() => setDonorSuccess(null)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-300"
                      >
                        Register Another Donor
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="border-b border-slate-200 pb-4">
                        <div className="flex items-center space-x-2 text-rose-600 text-xs font-bold mb-1">
                          <Droplet className="w-4 h-4" />
                          <span>ONLINE DONOR REGISTRATION</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Join as a Life-Saving Donor</h3>
                        <p className="text-slate-600 text-xs mt-0.5">
                          Register your pledge for upcoming blood donation drives or organ pledge campaigns.
                        </p>
                      </div>

                      <form onSubmit={handleDonorSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Select Donation Camp *</label>
                          <select
                            value={donorCamp}
                            onChange={(e) => setDonorCamp(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            {donationCampsList.map(c => (
                              <option key={c.id} value={c.title}>{c.title}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Donor Name *</label>
                          <input
                            type="text"
                            required
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="e.g. Rahul Sen"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
                            <input
                              type="tel"
                              required
                              value={donorPhone}
                              onChange={(e) => setDonorPhone(e.target.value)}
                              placeholder="+91-98300..."
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group *</label>
                            <select
                              value={donorBloodGroup}
                              onChange={(e) => setDonorBloodGroup(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                            >
                              <option value="O+">O Positive (O+)</option>
                              <option value="A+">A Positive (A+)</option>
                              <option value="B+">B Positive (B+)</option>
                              <option value="AB+">AB Positive (AB+)</option>
                              <option value="O-">O Negative (O-)</option>
                              <option value="A-">A Negative (A-)</option>
                              <option value="B-">B Negative (B-)</option>
                              <option value="AB-">AB Negative (AB-)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                            <input
                              type="number"
                              value={donorAge}
                              onChange={(e) => setDonorAge(e.target.value)}
                              placeholder="26"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Donation Type</label>
                            <select
                              value={donorType}
                              onChange={(e) => setDonorType(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                            >
                              <option value="Blood Donation">Blood Donation</option>
                              <option value="Single Donor Platelets">Single Donor Platelets</option>
                              <option value="Organ Pledge">Organ Pledge Donor</option>
                              <option value="Camp Volunteer">Camp Volunteer</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email / Notes (Optional)</label>
                          <input
                            type="text"
                            value={donorNotes}
                            onChange={(e) => setDonorNotes(e.target.value)}
                            placeholder="e.g. Donated 6 months ago, available on weekends"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={donorSubmitting}
                          className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {donorSubmitting ? (
                            <span>Processing Registration...</span>
                          ) : (
                            <>
                              <Heart className="w-4 h-4 fill-white" />
                              <span>Confirm Donor Registration</span>
                            </>
                          )}
                        </button>
                      </form>
                    </>
                  )}

                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: SERVICES */}
        {activeTab === 'services' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Ultrasound & Diagnostic Services</h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Complete range of diagnostic USG procedures with pricing, prep instructions, and machine specs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesList.map((svc) => (
                <div key={svc.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all space-y-4 shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">{svc.category}</span>
                      <span className="text-base font-black text-emerald-600">{svc.price}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{svc.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{svc.description}</p>
                    
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] space-y-1">
                      <p className="text-amber-900 font-bold flex items-center space-x-1">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        <span>Preparation Tip:</span>
                      </p>
                      <p className="text-slate-700 leading-snug">{svc.prep}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[10px]">Machine: {svc.machine}</span>
                    <button
                      onClick={() => {
                        setSelectedService(svc.title);
                        setActiveTab('book');
                        setBookingSuccess(null);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center space-x-1 shadow-2xs"
                    >
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOCTORS */}
        {activeTab === 'doctors' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Our Consultant Radiologists & USG Specialists</h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Senior MD Radiologists and Sonographer specialists available for consultation and scan slot appointments.
              </p>
            </div>

            {loadingDoctors ? (
              <p className="text-slate-500 text-xs">Loading doctors list...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((docItem) => (
                  <div key={docItem.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 hover:border-purple-300 hover:shadow-md transition-all shadow-xs">
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-blue-500/20 shrink-0">
                        {docItem.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900 truncate">{docItem.name}</h3>
                          <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                            ⭐ {docItem.rating} ({docItem.reviews_count})
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 font-semibold">{docItem.specialization}</p>
                        <p className="text-[11px] text-slate-500">{docItem.qualification}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Experience: {docItem.experience} • {docItem.room}</p>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      "{docItem.bio}"
                    </p>

                    <div>
                      <p className="text-[11px] font-bold text-slate-700 mb-2">Available Working Days:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {docItem.available_days?.map((day) => (
                          <span key={day} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded-md font-medium border border-slate-200">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-700 mb-2">USG Slot Timings:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {docItem.time_slots?.map((slot) => (
                          <span key={slot} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-md font-mono border border-indigo-200">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedDoctorId(docItem.id);
                          setActiveTab('book');
                          setBookingSuccess(null);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>Book Appointment with {docItem.name.split(' ')[1] || 'Doctor'}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BOOK APPOINTMENT */}
        {activeTab === 'book' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {bookingSuccess ? (
              <div className="bg-white border border-emerald-300 rounded-3xl p-8 space-y-6 shadow-xl text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">USG Appointment Confirmed!</h2>
                  <p className="text-slate-600 text-xs">
                    Your appointment request has been registered in Apex Diagnostic Center portal.
                  </p>
                </div>

                <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200 text-left max-w-lg mx-auto space-y-3 font-mono text-xs text-slate-800">
                  <div className="flex justify-between border-b border-emerald-200 pb-2">
                    <span className="text-slate-500">Booking Reference:</span>
                    <span className="text-emerald-700 font-bold">{bookingSuccess.reference_code || bookingSuccess.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200 pb-2">
                    <span className="text-slate-500">Patient Name:</span>
                    <span className="text-slate-900 font-bold">{bookingSuccess.patient_name} ({bookingSuccess.age}y/{bookingSuccess.gender})</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200 pb-2">
                    <span className="text-slate-500">USG Scan Service:</span>
                    <span className="text-blue-700 font-bold">{bookingSuccess.usg_service}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200 pb-2">
                    <span className="text-slate-500">Doctor / Radiologist:</span>
                    <span className="text-purple-700 font-bold">{bookingSuccess.doctor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Slot Time:</span>
                    <span className="text-amber-800 font-bold">{bookingSuccess.appointment_date} at {bookingSuccess.slot_time}</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-300"
                  >
                    Book Another Appointment
                  </button>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Return to Homepage
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
                
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex items-center space-x-2 text-purple-600 text-xs font-bold mb-1">
                    <CalendarCheck className="w-4 h-4" />
                    <span>ONLINE REGISTRATION PORTAL</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Book USG & Doctor Appointment</h2>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">
                    Select your required USG scan type, choose your preferred consultant doctor, and pick an available date/time slot.
                  </p>
                </div>

                <form onSubmit={handleBookSubmit} className="space-y-6">
                  
                  {/* Step 1 & 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Select USG Service</label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {servicesList.map(s => (
                          <option key={s.id} value={s.title}>{s.title} ({s.price})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Consultant Radiologist Doctor</label>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Step 3: Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Appointment Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Select Time Slot</label>
                      <div className="flex flex-wrap gap-2">
                        {(selectedDoctorObj?.time_slots || ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"]).map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                              selectedSlot === slot
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Patient Information</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Patient Name *</label>
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="e.g. Sunita Mukhopadhyay"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age (Years)</label>
                        <input
                          type="number"
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value)}
                          placeholder="28"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender</label>
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="+91-98300-12345"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address (Optional)</label>
                        <input
                          type="email"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="patient@gmail.com"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Referring Doctor & Clinical Notes</label>
                      <textarea
                        rows={2}
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="e.g. Referred by Dr. P. K. Roy for 20-week anomaly screening or lower abdominal pain evaluation."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {bookingSubmitting ? (
                      <span>Registering Appointment...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Confirm USG Appointment Booking</span>
                      </>
                    )}
                  </button>

                </form>

              </div>
            )}
          </div>
        )}

        {/* TAB 5: CONTACT US */}
        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Contact Apex Diagnostic Center</h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Reach out for appointment inquiries, report status, or emergency ultrasound assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Contact Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Center Address</p>
                      <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                        Apex Diagnostic & Ultrasound Center<br />
                        124 Medical Hub Enclave, Sector 4<br />
                        Kolkata, WB — 700091
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 border-t border-slate-100 pt-4">
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Phone Lines</p>
                      <p className="text-slate-600 text-xs mt-0.5">+91 98300 12345 / 033-2455-8800</p>
                      <p className="text-emerald-700 text-[11px] font-semibold">24/7 Emergency USG Line Active</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 border-t border-slate-100 pt-4">
                    <Mail className="w-5 h-5 text-purple-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Email Address</p>
                      <p className="text-slate-600 text-xs mt-0.5">contact@apexusgdiagnostic.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 border-t border-slate-100 pt-4">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Working Hours</p>
                      <p className="text-slate-600 text-xs mt-0.5">Monday – Saturday: 8:00 AM – 8:00 PM</p>
                      <p className="text-slate-600 text-xs">Sunday: 9:00 AM – 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                  <h3 className="text-lg font-bold text-slate-900">Send Us a Direct Message</h3>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Name"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="Phone Number"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Message or Query</label>
                      <textarea
                        rows={4}
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder="Type your inquiry about scan dates, prices, or report status..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                    >
                      Submit Message
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Lightbox Modal for Hospital Photos */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative space-y-4 p-6">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden max-h-[60vh]">
              <img
                src={previewImage.src}
                alt={previewImage.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  {previewImage.category}
                </span>
                <h3 className="text-lg font-black text-slate-900">{previewImage.title}</h3>
              </div>
              <p className="text-xs text-slate-700 font-semibold">{previewImage.subtitle}</p>
              <p className="text-xs text-slate-600 pt-1 leading-relaxed">{previewImage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-slate-400 text-xs space-y-2">
        <p className="font-bold text-slate-300">Apex Multi-Specialty Hospital & Diagnostic Center Portal</p>
        <p className="text-[11px] text-slate-500">
          Super Admin: <span className="text-blue-400 font-semibold">abhisekkoyal334@gmail.com</span> | High Precision AI Radiodiagnosis & Community Care
        </p>
      </footer>

    </div>
  );
}
