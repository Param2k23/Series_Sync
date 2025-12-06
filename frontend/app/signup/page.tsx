'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Phone, 
  Linkedin,
  Instagram,
  Twitter,
  ChevronDown,
  Sparkles,
  Camera,
  User,
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  X,
} from 'lucide-react';
import { signup, login, scrapeUserSocialMedia, getUserByPhone } from '@/lib/database';

// Reddit icon component
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

// Login Modal Component
function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if user exists
    const user = getUserByPhone(phone);
    if (!user) {
      setError('No account found with this phone number');
      return;
    }
    
    setStep('otp');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    // For demo, accept any 6-digit OTP
    if (otpValue.length === 6) {
      const user = login(phone);
      if (user) {
        router.push('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 mx-4">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {step === 'phone' ? 'Welcome back' : 'Enter verification code'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {step === 'phone' 
                    ? 'Enter your phone number to sign in' 
                    : `We sent a code to ${phone}`
                  }
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone" className="text-slate-700 text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Demo: Use +1234567890 to +1234567899
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  >
                    Send Code
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Demo: Enter any 6 digits
                  </p>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                    disabled={otp.join('').length !== 6}
                  >
                    Verify & Sign In
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-full text-sm text-slate-500 hover:text-slate-700"
                  >
                    Use a different number
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    dob: '',
    phone: '',
    location: '',
    occupation: '',
    bio: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    reddit: '',
  });
  const [showSocials, setShowSocials] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In - would integrate with OAuth');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Create user in database
      const newUser = signup({
        phone: formData.phone,
        name: formData.name,
        username: formData.username,
        dob: formData.dob,
        location: formData.location,
        occupation: formData.occupation,
        bio: formData.bio,
        profileImage: profileImage || undefined,
        socialProfiles: {
          linkedin: formData.linkedin || undefined,
          twitter: formData.twitter || undefined,
          instagram: formData.instagram || undefined,
          reddit: formData.reddit || undefined,
        },
        scrapedAttributes: {
          interests: [],
          skills: [],
          industries: [],
          topics: [],
          sentiment: 'neutral',
          activityLevel: 'low',
        },
      });

      // Simulate scraping if social profiles provided
      if (formData.linkedin || formData.twitter || formData.instagram || formData.reddit) {
        scrapeUserSocialMedia(newUser.id, {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          instagram: formData.instagram,
          reddit: formData.reddit,
        });
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-40 pointer-events-none">
        <div 
          className="absolute top-20 right-20 w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLoginModal(true)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            Already a user? Sign in
          </Button>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 mb-5 shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-slate-900 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Create your profile
            </motion.h1>
            <motion.p 
              className="text-slate-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Tell us about yourself to find your perfect communities
            </motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Google Sign In */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex-1 h-11 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium flex items-center justify-center gap-2 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </motion.button>
                <span className="text-slate-400 text-sm">Quick signup</span>
              </div>

              {/* Profile Photo */}
              <div className="flex justify-center">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-slate-400 transition-all duration-200 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-slate-500 mx-auto transition-colors" />
                        <span className="text-xs text-slate-400 group-hover:text-slate-500 mt-1 block transition-colors">Add photo</span>
                      </div>
                    )}
                  </motion.button>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-slate-800 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Name and Username row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 text-sm font-medium">
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 text-sm font-medium">
                    Username <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="pl-8 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Phone (Required) and DOB row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 text-sm font-medium">
                    Phone Number <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400">Used for login & verification</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-slate-700 text-sm font-medium">
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Location and Occupation row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-700 text-sm font-medium">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-slate-700 text-sm font-medium">
                    Occupation
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="occupation"
                      type="text"
                      placeholder="Software Engineer"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-700 text-sm font-medium">
                  Bio
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself, your interests, and what you're looking for..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 200) })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-300 resize-none text-sm transition-all outline-none"
                  />
                </div>
                <p className="text-slate-400 text-xs text-right">{formData.bio.length}/200</p>
              </div>

              {/* Social handles toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSocials(!showSocials)}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSocials ? 'rotate-180' : ''}`} />
                  Connect social profiles
                  <span className="text-slate-400 text-xs">(helps us match you better)</span>
                </button>

                <motion.div
                  initial={false}
                  animate={{ 
                    height: showSocials ? 'auto' : 0,
                    opacity: showSocials ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-600 text-xs font-medium flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                        LinkedIn
                      </Label>
                      <Input
                        type="text"
                        placeholder="username"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="h-9 text-sm bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 text-xs font-medium flex items-center gap-1.5">
                        <Twitter className="w-3.5 h-3.5 text-slate-800" />
                        Twitter
                      </Label>
                      <Input
                        type="text"
                        placeholder="@handle"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="h-9 text-sm bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 text-xs font-medium flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
                        Instagram
                      </Label>
                      <Input
                        type="text"
                        placeholder="@handle"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="h-9 text-sm bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 text-xs font-medium flex items-center gap-1.5">
                        <span className="text-[#FF4500]"><RedditIcon /></span>
                        Reddit
                      </Label>
                      <Input
                        type="text"
                        placeholder="u/name"
                        value={formData.reddit}
                        onChange={(e) => setFormData({ ...formData, reddit: e.target.value })}
                        className="h-9 text-sm bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg shadow-slate-900/10 transition-all duration-200 mt-4"
              >
                {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
              </Button>
            </form>
          </motion.div>

          {/* Terms */}
          <motion.p 
            className="text-center text-xs text-slate-400 mt-6 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-slate-500 hover:text-slate-700 underline underline-offset-2">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-slate-500 hover:text-slate-700 underline underline-offset-2">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
