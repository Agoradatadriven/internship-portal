import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, UploadCloud, Link as LinkIcon, AlertCircle, Loader2, Check, X, FileText, ChevronDown } from 'lucide-react';

type Availability = '' | 'Immediate' | '1-2 Weeks' | 'Other';
type InterestArea = '' | 'Lead Generation' | 'Meta Ads' | 'Google Ads' | 'Creative Execution' | 'Reporting' | 'Campaign Operations';

interface FormData {
  fullName: string;
  email: string;
  address: string;
  status: string;
  availability: Availability | string;
  resume: File | null;
  video: File | null;
  isVideoTooLarge: boolean;
  videoUrl: string;
  portfolioUrl: string;
  interest: InterestArea | string;
  tools: string[];
  fitReason: string;
  consent1: boolean;
  consent2: boolean;
  consent3: boolean;
  consent4: boolean;
}

const INITIAL_DATA: FormData = {
  fullName: '',
  email: '',
  address: '',
  status: '',
  availability: '',
  resume: null,
  video: null,
  isVideoTooLarge: false,
  videoUrl: '',
  portfolioUrl: '',
  interest: '',
  tools: [],
  fitReason: '',
  consent1: false,
  consent2: false,
  consent3: false,
  consent4: false,
};

const TOOLS = ['Canva', 'CapCut', 'Meta Ads Manager', 'Google Ads', 'Google Sheets', 'Excel'];

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const STATUS_OPTIONS = [
  { value: 'Student', label: 'Student (Current)', desc: 'For those still in the middle of their degree.' },
  { value: 'Working Student', label: 'Working Student', desc: 'Indicates they are already balancing a job and studies (shows high grit).' },
  { value: 'Fresh Graduate', label: 'Fresh Graduate', desc: 'Ready for immediate full-time transition after 2 months.' },
  { value: 'Career Changer', label: 'Career Changer', desc: 'Someone moving from a different industry into Data/Marketing.' },
  { value: 'Freelancer', label: 'Freelancer / Self-Employed', desc: 'They have some independent experience but want agency structure.' },
  { value: 'Unemployed', label: 'Unemployed (Actively Looking)', desc: 'Ready to start immediately.' },
  { value: 'Gap Year', label: 'Gap Year', desc: 'Taking time off to gain skills.' }
];

export default function App() {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAgreement, setShowAgreement] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.address.trim() || !formData.status || !formData.availability) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.resume) {
        setErrorMsg('Please upload your Resume/CV.');
        return;
      }
      if (!formData.video && !formData.isVideoTooLarge && !formData.videoUrl) {
         setErrorMsg('Please upload a video introduction or provide a link.');
         return;
      }
      if (formData.isVideoTooLarge && !formData.videoUrl.trim()) {
         setErrorMsg('Please provide a link to your video introduction.');
         return;
      }
    }
    if (step === 3) {
      if (!formData.interest) {
        setErrorMsg('Please select your area of interest.');
        return;
      }
      if (!formData.fitReason.trim()) {
        setErrorMsg('Please tell us why you are a good fit.');
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s - 1);
  };

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 40 * 1024 * 1024) { // 40MB
        setFormData(prev => ({ ...prev, video: null, isVideoTooLarge: true }));
      } else {
        setFormData(prev => ({ ...prev, video: file, isVideoTooLarge: false, videoUrl: '' }));
      }
    }
  };

  const submitApplication = async () => {
    if (!formData.consent1 || !formData.consent2 || !formData.consent3 || !formData.consent4) {
      setErrorMsg('You must agree to all terms before submitting.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      let resumeB64 = '';
      if (formData.resume) resumeB64 = await toBase64(formData.resume);

      let videoB64 = '';
      if (formData.video) videoB64 = await toBase64(formData.video);
      
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        availability: formData.availability,
        resumeName: formData.resume?.name || '',
        resumeMimeType: formData.resume?.type || '',
        resumeBody: resumeB64.split(',')[1] || resumeB64,
        videoName: formData.video?.name || '',
        videoMimeType: formData.video?.type || '',
        videoBody: videoB64.split(',')[1] || videoB64,
        videoUrl: formData.videoUrl,
        portfolioUrl: formData.portfolioUrl,
        interest: formData.interest,
        tools: formData.tools.join(', '),
        fitReason: formData.fitReason,
      };

      await fetch('https://script.google.com/macros/s/AKfycbzcRieJ2M2OGry9Mx44VdYm5djXMQP7jnro3z_heCpOkzbKHFNYwCjLerbX5h9Kgg8W/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(5);
    } catch (err) {
      console.error(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f8fafc] font-sans text-slate-900 md:p-6 lg:p-8 selection:bg-[#4cac4c]/20">
      <div className="relative w-full md:max-w-4xl flex flex-col bg-white min-h-[100dvh] md:min-h-0 md:h-[720px] md:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] md:rounded-3xl overflow-hidden ring-1 ring-slate-900/5">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-6 sm:px-10 py-5 flex justify-between items-center shrink-0 z-20">
          <a href="https://agoradatadriven.com" target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer group">
            <img 
              src="/logo.png" 
              alt="Agora Data Driven Logo" 
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </a>
          
          <div className="flex items-center">
            {step >= 1 && step <= 4 && (
              <div className="flex items-center gap-2 sm:gap-3">
                {[1, 2, 3, 4].map((num, i) => (
                  <React.Fragment key={num}>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                      step >= num ? 'bg-[#4cac4c] text-white shadow-md shadow-[#4cac4c]/20 ring-4 ring-[#4cac4c]/10' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step > num ? <CheckCircle2 size={18} strokeWidth={2.5} /> : num}
                    </div>
                    {i < 3 && <div className={`h-[2px] w-4 sm:w-8 rounded-full transition-colors duration-500 ${step > i + 1 ? 'bg-[#4cac4c]' : 'bg-slate-200'}`}></div>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center p-6 sm:p-10 lg:p-12 relative scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="hero" variants={slideVariants} initial="hidden" animate="visible" exit="exit"
                className="max-w-2xl mt-auto mb-auto w-full text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4cac4c]/10 text-[#4cac4c] text-xs font-bold tracking-widest uppercase mb-8 ring-1 ring-[#4cac4c]/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4cac4c] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4cac4c]"></span>
                  </span>
                  Internship Program {new Date().getFullYear()}
                </div>
                <h1 className="text-[1.35rem] min-[400px]:text-[1.65rem] sm:text-4xl lg:text-[2.75rem] font-bold text-slate-900 leading-[1.3] sm:leading-[1.25] mb-5 sm:mb-6">
                  <span className="whitespace-nowrap">Accelerate Growth Through</span> <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4cac4c] to-[#368536]">Data-Driven Marketing.</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-12 max-w-xl mx-auto leading-relaxed">
                  Join the Agora Lead Generation Team. We are seeking driven, detail-oriented interns ready to execute high-performance campaigns and master digital growth.
                </p>
                <button 
                  onClick={nextStep}
                  className="btn-agora btn-agora-inline mx-auto"
                >
                  <span className="text-container">
                    <span className="text">Start Application <ArrowRight className="w-5 h-5 shrink-0" /></span>
                  </span>
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit"
                className="w-full max-w-xl text-left mt-auto mb-auto"
              >
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-3xl font-bold text-slate-900">The Basics</h2>
                  <p className="text-slate-500 mt-2">Let's start with your contact information.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-[#4cac4c]">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4cac4c] focus:ring-4 focus:ring-[#4cac4c]/10 transition-all placeholder:text-slate-400 text-slate-800 text-base shadow-sm"
                      placeholder="e.g. Sample Name"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-[#4cac4c]">Email Address <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4cac4c] focus:ring-4 focus:ring-[#4cac4c]/10 transition-all placeholder:text-slate-400 text-slate-800 text-base shadow-sm"
                      placeholder="e.g. name@sample.com"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-[#4cac4c]">Address <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4cac4c] focus:ring-4 focus:ring-[#4cac4c]/10 transition-all placeholder:text-slate-400 text-slate-800 text-base shadow-sm"
                      placeholder="e.g. 123 Main St, City, Country"
                    />
                  </div>
                  <div className="space-y-2 group relative" ref={statusMenuRef}>
                    <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-[#4cac4c]">Current Status <span className="text-red-500">*</span></label>
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 bg-white border ${isStatusDropdownOpen ? 'border-[#4cac4c] ring-4 ring-[#4cac4c]/10' : 'border-slate-200'} rounded-xl focus:outline-none transition-all text-base shadow-sm text-left ${!formData.status ? 'text-slate-400' : 'text-slate-800'}`}
                    >
                      <div className="flex-1 truncate">
                        {formData.status ? (
                          <>
                            <div className="font-semibold">{STATUS_OPTIONS.find(opt => opt.value === formData.status)?.label}</div>
                            <div className="text-xs text-slate-500 font-normal mt-0.5 truncate pr-2">
                              {STATUS_OPTIONS.find(opt => opt.value === formData.status)?.desc}
                            </div>
                          </>
                        ) : 'Select your current status...'}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isStatusDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden"
                        >
                          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 p-1">
                            {STATUS_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setFormData({ ...formData, status: option.value });
                                  setIsStatusDropdownOpen(false);
                                }}
                                className={`w-full text-left flex flex-col p-3 rounded-lg transition-colors ${formData.status === option.value ? 'bg-green-50 text-slate-900' : 'hover:bg-slate-50 text-slate-700'}`}
                              >
                                <span className={`text-sm font-semibold ${formData.status === option.value ? 'text-[#4cac4c]' : ''}`}>{option.label}</span>
                                <span className={`text-xs mt-1 ${formData.status === option.value ? 'text-[#4cac4c]/70' : 'text-slate-500'}`}>{option.desc}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-[#4cac4c]">Current Availability <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select 
                        value={formData.availability}
                        onChange={e => setFormData({...formData, availability: e.target.value as Availability})}
                        className={`w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4cac4c] focus:ring-4 focus:ring-[#4cac4c]/10 transition-all appearance-none text-base shadow-sm ${!formData.availability ? 'text-slate-400' : 'text-slate-800'}`}
                      >
                        <option value="" disabled>Select availability...</option>
                        <option value="Immediate" className="text-slate-800">Immediate</option>
                        <option value="1-2 Weeks" className="text-slate-800">1-2 Weeks</option>
                        <option value="Other" className="text-slate-800">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm mt-5 font-semibold flex items-center bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle size={16} className="mr-2 shrink-0"/>{errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-10">
                  <button 
                    onClick={nextStep}
                    className="btn-agora mt-2 w-full max-w-sm mx-auto"
                  >
                    <span className="text-container">
                      <span className="text">Next Step <ArrowRight className="w-5 h-5 shrink-0" /></span>
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit"
                className="w-full max-w-xl text-left mt-auto mb-auto"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Assets & Material</h2>
                    <p className="text-slate-500 mt-2">Upload your resume and video introduction.</p>
                  </div>
                  <button onClick={prevStep} className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5"><ArrowLeft className="w-4 h-4"/> Back</button>
                </div>
                
                <div className="space-y-6">
                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Upload Resume/CV (PDF preferred) <span className="text-red-500">*</span></label>
                    <div className={`relative bg-slate-50 border-2 border-dashed ${formData.resume ? 'border-[#4cac4c] bg-green-50/20' : 'border-slate-200 hover:border-[#4cac4c]/50 hover:bg-slate-50/50'} rounded-2xl p-8 transition-all duration-300 group flex flex-col items-center justify-center text-center cursor-pointer`}>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={e => setFormData({...formData, resume: e.target.files?.[0] || null})}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${formData.resume ? 'bg-[#4cac4c]/10' : 'bg-white shadow-sm border border-slate-100 group-hover:border-[#4cac4c]/20'}`}>
                        <UploadCloud className={`w-7 h-7 ${formData.resume ? 'text-[#4cac4c]' : 'text-slate-400 group-hover:text-[#4cac4c]/80'}`} />
                      </div>
                      {formData.resume ? (
                        <div className="space-y-1">
                          <p className="text-[#4cac4c] font-semibold text-base break-all px-4">{formData.resume.name}</p>
                          <p className="text-slate-400 text-xs">Click to replace file</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-slate-700 font-semibold">Click to upload or drag & drop</p>
                          <p className="text-slate-400 text-sm">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Upload Logic */}
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700 block">
                       A short introduction about yourself (video) <span className="text-red-500">*</span>
                       <span className="block text-xs text-slate-500 font-normal mt-1 leading-relaxed">Tell us who you are, why you're interested in data-driven marketing, and what excites you about this internship. Just be yourself!</span>
                     </label>
                     {!formData.isVideoTooLarge ? (
                       <div className={`relative bg-slate-50 border-2 border-dashed ${formData.video ? 'border-[#4cac4c] bg-green-50/20' : 'border-slate-200 hover:border-[#4cac4c]/50 hover:bg-slate-50/50'} rounded-2xl p-8 transition-all duration-300 group flex flex-col items-center justify-center text-center cursor-pointer`}>
                        <input 
                          type="file" 
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${formData.video ? 'bg-[#4cac4c]/10' : 'bg-white shadow-sm border border-slate-100 group-hover:border-[#4cac4c]/20'}`}>
                          <UploadCloud className={`w-7 h-7 ${formData.video ? 'text-[#4cac4c]' : 'text-slate-400 group-hover:text-[#4cac4c]/80'}`} />
                        </div>
                        {formData.video ? (
                          <div className="space-y-1">
                            <p className="text-[#4cac4c] font-semibold text-base break-all px-4">{formData.video.name}</p>
                            <p className="text-slate-400 text-xs">Click to replace file</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-slate-700 font-semibold">Click to upload video</p>
                            <p className="text-slate-400 text-sm">MP4, WEBM, MOV up to 40MB</p>
                          </div>
                        )}
                      </div>
                     ) : (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="w-full pt-1">
                               <p className="text-amber-900 text-sm font-bold mb-1">File too large (Max 40MB)</p>
                               <p className="text-amber-700/80 text-sm mb-4 leading-relaxed">Since it exceeds the limit, please upload it to Google Drive or Loom and paste the link below instead.</p>
                               <div className="relative group/url">
                                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within/url:text-amber-600" />
                                  <input 
                                    type="url" 
                                    placeholder="https://drive.google.com/..."
                                    value={formData.videoUrl}
                                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm shadow-sm placeholder:text-slate-300"
                                  />
                               </div>
                               <button 
                                 onClick={() => setFormData({...formData, isVideoTooLarge: false, videoUrl: ''})}
                                 className="text-xs text-amber-700 hover:text-amber-900 font-bold mt-4 underline underline-offset-2 transition-colors"
                               >
                                 Retry Upload (Smaller file)
                               </button>
                            </div>
                         </div>
                       </motion.div>
                     )}
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-[#4cac4c]">Portfolio Link (Optional)</label>
                    <div className="relative">
                       <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 transition-colors group-focus-within:text-[#4cac4c]" />
                       <input 
                         type="url" 
                         value={formData.portfolioUrl}
                         onChange={e => setFormData({...formData, portfolioUrl: e.target.value})}
                         className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4cac4c] focus:ring-4 focus:ring-[#4cac4c]/10 transition-all placeholder:text-slate-400 text-slate-800 text-base shadow-sm"
                         placeholder="https://yourportfolio.com"
                       />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm mt-5 font-semibold flex items-center bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle size={16} className="mr-2 shrink-0"/>{errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-10">
                  <button onClick={nextStep} className="btn-agora mt-2 w-full max-w-sm mx-auto">
                    <span className="text-container">
                      <span className="text">Next Step <ArrowRight className="w-5 h-5 shrink-0" /></span>
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit"
                className="w-full max-w-xl text-left mt-auto mb-auto"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">The Assessment</h2>
                    <p className="text-slate-500 mt-2">Help us understand your focus and skills.</p>
                  </div>
                  <button onClick={prevStep} className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5"><ArrowLeft className="w-4 h-4"/> Back</button>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">Primary Interest <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Lead Generation', 'Meta Ads', 'Google Ads', 'Creative Execution', 'Reporting', 'Campaign Operations'].map((area) => (
                        <button 
                          key={area}
                          onClick={() => setFormData({...formData, interest: area})}
                          className={`relative p-4 rounded-xl border text-sm font-semibold transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 h-full ${
                            formData.interest === area 
                              ? 'border-[#4cac4c] bg-[#4cac4c]/5 text-[#4cac4c] shadow-sm ring-1 ring-[#4cac4c]' 
                              : 'border-slate-200 bg-white hover:border-[#4cac4c]/50 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${formData.interest === area ? 'border-[#4cac4c]' : 'border-slate-300'}`}>
                            {formData.interest === area && <div className="w-2.5 h-2.5 bg-[#4cac4c] rounded-full"></div>}
                          </div>
                          <span className="leading-tight">{area}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">Tool Experience <span className="text-red-500">*</span> <span className="text-slate-400 font-normal text-xs ml-1">(Select all that apply)</span></label>
                    <div className="flex flex-wrap gap-2.5">
                      {TOOLS.map((tool) => {
                        const isSelected = formData.tools.includes(tool);
                        return (
                          <button 
                            key={tool}
                            onClick={() => handleToolToggle(tool)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold tracking-wide transition-all duration-200 flex items-center shadow-sm ${
                              isSelected 
                                ? 'bg-[#4cac4c] text-white border-[#4cac4c] ring-2 ring-[#4cac4c]/20' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center transition-colors ${isSelected ? 'border-white bg-[#4cac4c]' : 'border-slate-300 bg-white'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                            {tool}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-[#4cac4c]">Why are you a good fit? <span className="text-red-500">*</span></label>
                    <textarea 
                      rows={5}
                      value={formData.fitReason}
                      onChange={e => setFormData({...formData, fitReason: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4cac4c] focus:ring-4 focus:ring-[#4cac4c]/10 transition-all placeholder:text-slate-300 resize-none text-base text-slate-800 shadow-sm leading-relaxed"
                      placeholder="Detail your readiness, skills, and what makes you detail-oriented..."
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm mt-5 font-semibold flex items-center bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle size={16} className="mr-2 shrink-0"/>{errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-10">
                  <button onClick={nextStep} className="btn-agora mt-2 w-full max-w-sm mx-auto">
                    <span className="text-container">
                      <span className="text">Next Step <ArrowRight className="w-5 h-5 shrink-0" /></span>
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit"
                className="w-full max-w-xl text-left mt-auto mb-auto"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Consent & Submit</h2>
                    <p className="text-slate-500 mt-2">Acknowledge agreement to finalize.</p>
                  </div>
                  <button onClick={prevStep} disabled={isLoading} className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"><ArrowLeft className="w-4 h-4"/> Back</button>
                </div>
                
                <div className="mb-8">
                  <button 
                    onClick={() => setShowAgreement(true)}
                    className="w-full relative overflow-hidden group bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-slate-50 border border-slate-200 hover:border-[#4cac4c] p-6 rounded-2xl transition-all duration-300 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#4cac4c]/10 text-[#4cac4c] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#4cac4c]/20 transition-all duration-300">
                        <FileText className="w-6 h-6" strokeWidth={2.5} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#4cac4c] transition-colors">Read the Full Internship Agreement</h3>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">Please review the details before submitting.</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-[#4cac4c] group-hover:bg-[#4cac4c] transition-all">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'consent1', text: "I understand this is an execution-focused internship to evaluate my readiness for a long-term junior role." },
                    { id: 'consent2', text: "I agree to strict confidentiality regarding all client data, account access, and internal processes." },
                    { id: 'consent3', text: "I acknowledge the compensation structure (₱350 per day for the 2-month duration)." },
                    { id: 'consent4', text: "I authorize Agora Data Driven to securely store my uploaded files and personal data for recruitment and evaluation purposes." }
                  ].map((item: any) => (
                    <label key={item.id} className={`flex items-start p-5 bg-white border ${formData[item.id as keyof FormData] ? 'border-[#4cac4c] ring-1 ring-[#4cac4c] bg-green-50/10' : 'border-slate-200 hover:border-slate-300'} rounded-xl cursor-pointer transition-all shadow-sm`}>
                      <div className="flex items-center h-5 mt-0.5 shrink-0">
                        <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${formData[item.id as keyof FormData] ? 'bg-[#4cac4c] border-[#4cac4c]' : 'bg-white border-slate-300'}`}>
                           {formData[item.id as keyof FormData] && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={formData[item.id as keyof FormData] as boolean}
                          onChange={e => setFormData({...formData, [item.id]: e.target.checked})}
                          className="hidden"
                        />
                      </div>
                      <div className={`ml-4 text-sm font-medium leading-relaxed ${formData[item.id as keyof FormData] ? 'text-slate-900' : 'text-slate-600'}`}>
                        {item.text}
                      </div>
                    </label>
                  ))}
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm mt-5 font-semibold flex items-center bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle size={16} className="mr-2 shrink-0"/>{errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-10 pt-4 border-t border-slate-100">
                  <button 
                    onClick={submitApplication}
                    disabled={isLoading}
                    className="btn-agora mt-2 w-full max-w-sm mx-auto"
                  >
                    <span className="text-container">
                      <span className="text">
                        {isLoading ? (
                          <><Loader2 className="animate-spin w-5 h-5 shrink-0" /> Processing Securely...</>
                        ) : (
                          'Submit Full Application'
                        )}
                      </span>
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="success" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="max-w-lg mx-auto mt-auto mb-auto text-center"
              >
                <div className="w-40 h-40 sm:w-52 sm:h-52 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner shadow-green-50 ring-4 ring-green-50">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="w-full h-full flex items-center justify-center p-3 sm:p-4"
                  >
                    <img src="/agora-icon.png" alt="Agora Data Driven Icon" className="w-full h-full object-contain drop-shadow-sm" />
                  </motion.div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Application Received!</h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-10">
                  We will review your submission and contact you regarding the Initial Screening and Assessment Task. Please check your email.
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-agora btn-agora-inline mx-auto"
                >
                  <span className="text-container">
                    <span className="text">Return to Home</span>
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="px-6 sm:px-10 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-center items-center text-xs text-slate-400 font-semibold tracking-wider uppercase shrink-0 gap-4 sm:gap-0 z-10 w-full bg-slate-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4 w-full">
            <span>&copy; {new Date().getFullYear()} Agora</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
            <a href="#" className="hover:text-slate-600 transition-colors hidden sm:block">Careers</a>
            <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
            <a href="#" className="hover:text-slate-600 transition-colors hidden sm:block">Privacy</a>
          </div>
        </footer>

      </div>
      
      <AnimatePresence>
        {showAgreement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 min-[400px]:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgreement(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Internship Summary & Agreement</h2>
                  <p className="text-sm font-medium text-[#4cac4c] mt-1">Please read carefully</p>
                </div>
                <button 
                  onClick={() => setShowAgreement(false)} 
                  className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors flex shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-0 sm:p-6 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="bg-white mx-auto max-w-2xl sm:rounded-xl shadow-sm border-x border-b sm:border border-slate-200 p-8 sm:p-12">
                  <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-8">
                    <div>
                      <img src="/logo.png" alt="Agora Logo" className="h-10 w-auto mb-4" />
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Internship Program</h1>
                      <p className="text-slate-500 font-medium text-sm tracking-widest uppercase mt-1">Official Framework & Agreement</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Document Rev</p>
                      <p className="text-sm font-bold text-slate-900">{new Date().getFullYear()}.01</p>
                    </div>
                  </div>

                  <div className="prose prose-sm sm:prose-base max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-bold prose-h3:text-xl prose-h3:uppercase prose-h3:tracking-wide prose-h4:text-lg prose-ul:list-disc prose-ul:pl-5 marker:text-[#4cac4c] prose-hr:border-slate-200 prose-hr:my-10 space-y-4">
                    <h3 className="!mt-0 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-900 text-sm">1.0</span>
                      Application Process Summary
                    </h3>
                    <p>This internship is execution-focused. It is designed for applicants who are willing to learn through real work, follow systems, and grow into a strong support role in lead generation and paid media operations. We value attitude, reliability, and attention to detail as much as prior experience.</p>
                    
                    <div className="grid sm:grid-cols-3 gap-4 my-6">
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                        <div className="font-bold text-slate-900 text-sm mb-1">Step 1: Submission</div>
                        <p className="text-xs">Submit resume, video intro, availability, and answers.</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                        <div className="font-bold text-slate-900 text-sm mb-1">Step 2: Assessment</div>
                        <p className="text-xs">Shortlisted applicants complete a practical task.</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                        <div className="font-bold text-slate-900 text-sm mb-1">Step 3: Interview</div>
                        <p className="text-xs">Finalists interviewed for the final decision.</p>
                      </div>
                    </div>
                    
                    <hr />
                    
                    <h3 className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-900 text-sm">2.0</span>
                      Role Summary & Basics
                    </h3>

                    <h4>2.1 Role Purpose</h4>
                    <p>This internship is designed to train and evaluate someone for a potential long-term role in our Lead Generation Team. The intern will support campaign operations, creative execution, lead generation workflows, and basic reporting.</p>
                    <p>The purpose of the application process is to identify interns who are:</p>
                    <ul className="grid grid-cols-2 gap-x-4">
                      <li>Reliable</li>
                      <li>Coachable</li>
                      <li>Detail-oriented</li>
                      <li>Comfortable with execution</li>
                    </ul>

                    <h4>2.2 Team Function & Intern Scope</h4>
                    <p>The Lead Generation Team supports media buying, Meta Ads, Google Ads, lead generation campaigns, front-end funnel support, email campaigns, demand generation, creative execution, campaign setup, reporting, and basic optimization support.</p>

                    <div className="bg-[#4cac4c]/5 border border-[#4cac4c]/20 p-5 rounded-xl my-6">
                      <h4 className="text-[#4cac4c] !mt-0 !mb-3">What the Intern Will Help With</h4>
                      <ul className="!my-0">
                        <li>Campaign setup support</li>
                        <li>Creative editing in Canva and CapCut</li>
                        <li>QA and checklist support</li>
                        <li>Reporting updates</li>
                        <li>Funnel and lead flow checks</li>
                        <li>File and asset organization</li>
                        <li>Basic campaign operations support</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 border border-red-100 p-5 rounded-xl my-6">
                      <h4 className="text-red-700 !mt-0 !mb-3">What the Intern Will Not Own Yet</h4>
                      <ul className="!my-0 marker:text-red-400">
                        <li>Campaign strategy</li>
                        <li>Budget decisions</li>
                        <li>Client communication</li>
                        <li>Final launch approvals</li>
                        <li>Major optimization decisions</li>
                        <li>Unsupervised live account changes</li>
                      </ul>
                    </div>

                    <h4>2.3 Internship Progression</h4>
                    <p>The internship is structured in phases. Week 1 focuses on orientation, tools, workflows, and basic support tasks. Weeks 2 to 4 focus on guided execution across campaign setup, creative support, QA, and reporting. Weeks 5 to 8 focus on handling recurring tasks with more independence and being evaluated for long-term fit.</p>

                    <hr />
                    
                    <h3 className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-900 text-sm">3.0</span>
                      Expectations & Criteria
                    </h3>
                    <p>We are not only looking for experience. We are mainly looking for people who show reliability, attention to detail, coachability, clear communication, strong work ethic, willingness to learn, and genuine interest in campaign operations.</p>

                    <hr />

                    <h3 className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-900 text-sm">4.0</span>
                      Payment Structure
                    </h3>
                    <div className="overflow-hidden border border-slate-200 rounded-lg my-4">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <th className="px-4 py-3 bg-slate-50 font-bold text-slate-900 w-1/3">Compensation Rate</th>
                            <td className="px-4 py-3 bg-white">₱350 per day (attended/worked)</td>
                          </tr>
                          <tr>
                            <th className="px-4 py-3 bg-slate-50 font-bold text-slate-900">Duration</th>
                            <td className="px-4 py-3 bg-white">2 Months</td>
                          </tr>
                          <tr>
                            <th className="px-4 py-3 bg-slate-50 font-bold text-slate-900">Estimated Allowance</th>
                            <td className="px-4 py-3 bg-white">~₱7,700/month (based on 22 working days)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <p className="text-xs text-slate-500 italic mt-2">
                      Notes: The internship allowance is intended to support interns during the training and execution period. Payment is based on actual attendance. Absences or unworked days will not be included unless approved. The internship does not guarantee regular employment, though successful interns may be considered for a junior role.
                    </p>

                    <hr />

                    <h3 className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-900 text-sm">5.0</span>
                      Career Ladder
                    </h3>
                    
                    <div className="space-y-4 my-6 relative before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-slate-100">
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">1</div>
                        <h4 className="!my-0">Lead Generation Team Intern</h4>
                        <p className="text-sm mt-1 mb-0">Learns the workflow and supports execution. Moves up when reliable, coachable, and handles basic tasks with less supervision.</p>
                      </div>
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">2</div>
                        <h4 className="!my-0">Junior Lead Generation Team Member</h4>
                        <p className="text-sm mt-1 mb-0">Handles recurring campaign work. Moves up when delivering consistently with minimal hand-holding.</p>
                      </div>
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">3</div>
                        <h4 className="!my-0">Department Head / Team Lead</h4>
                        <p className="text-sm mt-1 mb-0">Leads execution quality and team output. Trains junior members.</p>
                      </div>
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">4</div>
                        <h4 className="!my-0">Client Account Manager</h4>
                        <p className="text-sm mt-1 mb-0">Owns client communication, expectations, and account direction.</p>
                      </div>
                    </div>

                    <hr />

                    <h3 className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-900 text-sm">6.0</span>
                      Internship Basics & Rules
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-1">Reporting Manager</p>
                        <p className="text-sm !my-0">Zhen Zagala</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-1">Communication Channel</p>
                        <p className="text-sm !my-0">Messenger</p>
                      </div>
                    </div>
                    
                    <h4>6.1 Standard Rules</h4>
                    <ul>
                      <li>Follow attendance schedule and respond on time during work hours.</li>
                      <li>Ask for help early and escalate blockers immediately.</li>
                      <li>Follow naming and task tracking standards.</li>
                    </ul>
                    
                    <h4>6.2 Confidentiality and Data Handling</h4>
                    <p className="font-bold text-red-600 text-sm">CRITICAL MANDATE</p>
                    <ul className="text-sm">
                      <li>Client data, account access, reports, files, and internal processes are strictly confidential.</li>
                      <li>Do not share, copy, forward, or reuse company or client materials outside approved channels.</li>
                      <li>Do not use personal accounts unless approved.</li>
                      <li>Do not make live changes in accounts without approval.</li>
                    </ul>

                  </div>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 border-t border-slate-100 shrink-0 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setShowAgreement(false)} 
                  className="btn-agora btn-agora-inline"
                >
                  <span className="text-container">
                    <span className="text">I Have Read the Agreement</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
