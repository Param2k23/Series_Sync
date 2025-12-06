'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Home,
  User,
  LogOut,
  Camera,
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  Phone,
  Linkedin,
  Instagram,
  Twitter,
  Save,
  ArrowLeft,
} from 'lucide-react';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: User, label: 'Profile', href: '/dashboard/profile', active: true },
];

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    username: 'johndoe',
    dob: '1995-06-15',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    occupation: 'Software Engineer',
    bio: 'Passionate about building great products and connecting with amazing people.',
    linkedin: 'johndoe',
    instagram: '@johndoe',
    twitter: '@johndoe',
    reddit: 'u/johndoe',
  });

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-16 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 z-40 flex flex-col items-center py-6 shadow-sm">
        <Link href="/" className="mb-10">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
            <span className="text-white font-bold text-xs">SS</span>
          </div>
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                item.active 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </Link>
      </aside>

      {/* Main content */}
      <main className="ml-16 min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          {/* Back button */}
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to network</span>
          </Link>

          {/* Profile form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Photo section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-slate-400 transition-all group"
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400 group-hover:text-slate-500 transition-colors" />
                    )}
                  </button>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md hover:bg-slate-800 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{formData.name}</h1>
                  <p className="text-slate-500">@{formData.username}</p>
                </div>
              </div>
            </div>

            {/* Basic info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-5">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="pl-8 h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="pl-10 h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-10 h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium">Occupation</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="pl-10 h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <Label className="text-slate-500 text-xs font-medium">Bio</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 200) })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl resize-none text-sm outline-none focus:bg-white focus:border-slate-300 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 text-right">{formData.bio.length}/200</p>
              </div>
            </div>

            {/* Social profiles */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-5">Social Profiles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                    LinkedIn
                  </Label>
                  <Input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                    <Twitter className="w-3.5 h-3.5 text-slate-700" />
                    Twitter
                  </Label>
                  <Input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
                    Instagram
                  </Label>
                  <Input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                    <span className="text-[#FF4500]"><RedditIcon /></span>
                    Reddit
                  </Label>
                  <Input
                    type="text"
                    value={formData.reddit}
                    onChange={(e) => setFormData({ ...formData, reddit: e.target.value })}
                    className="h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-lg shadow-slate-900/10"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
