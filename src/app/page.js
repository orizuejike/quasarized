"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Microscope, Activity, Music, ExternalLink, 
  Mail, MessageCircle, PlayCircle, ShieldAlert, ChevronRight,
  Stethoscope, Fingerprint, HeartPulse, FileText, ArrowLeft,
  User, Lock, LogIn, CheckCircle, Eye, EyeOff, Clock, AlertTriangle
} from 'lucide-react';

// --- DATA IMPORTS ---
import { clinicalRiskArticles } from '@/data/clinicalRisk';
import { forensicCaseFiles } from '@/data/forensicCases';
import { dailyBlogPosts } from '@/data/dailyBlogPosts';
import { artists } from '@/data/artist';
import { courses, cbtSubjects } from '@/data/education';
import { biologyQuestions } from '@/data/cbtBiology';

// --- FIREBASE IMPORTS ---
import { auth, db } from '@/firebase';
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, 
  onAuthStateChanged, sendEmailVerification, GoogleAuthProvider, signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// ============================================================================
// COMPONENT: THE CBT EXAMINATION ENGINE
// ============================================================================
const CBTEngine = ({ studentName, questions, subject, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes = 1200 seconds
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  // Anti-Cheat States
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // 1. The Timer Effect
  useEffect(() => {
    if (isFinished || showCheatModal) return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, showCheatModal]);

  // 2. The Anti-Cheat Visibility Effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setCheatWarnings(prev => prev + 1);
        setShowCheatModal(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFinished]);

  const handleSelectAnswer = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const calculateScoreFeedback = (finalScore) => {
    if (finalScore < 20) return { title: "Poor Performance", text: "You need to review your foundational biology textbooks. Focus on cell biology and genetics.", color: "text-red-500" };
    if (finalScore < 30) return { title: "Fair Performance", text: "You have a basic grasp but lack depth. Revisit your plant and human physiology notes.", color: "text-yellow-500" };
    if (finalScore < 40) return { title: "Good Performance", text: "You are well prepared. Review tricky ecology and evolution questions to perfect your score.", color: "text-blue-400" };
    return { title: "Excellent Performance", text: "You are performing at top JAMB/WAEC standard. Outstanding work.", color: "text-green-500" };
  };

  const handleFinalSubmit = () => {
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) calculatedScore += 1;
    });
    setScore(calculatedScore);
    setIsFinished(true);
    setShowSubmitModal(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  if (isFinished) {
    const feedback = calculateScoreFeedback(score);
    return (
      <div className="bg-slate-950 min-h-screen p-6 font-sans animate-fade-in">
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-10 border-b border-slate-800 pb-8">
            <h1 className="font-serif text-5xl text-white mb-2">Examination Complete</h1>
            <p className="text-slate-400 text-lg">Candidate: <strong className="text-cyan-400">{studentName}</strong> | Subject: {subject}</p>
            <div className="mt-8">
              <span className="text-7xl font-bold text-white">{score}</span>
              <span className="text-3xl text-slate-500"> / 50</span>
            </div>
            <h2 className={`font-bold uppercase tracking-widest mt-4 ${feedback.color}`}>{feedback.title}</h2>
            <p className="text-slate-300 mt-2">{feedback.text}</p>
          </div>
          
          <div className="space-y-8">
            <h3 className="font-serif text-2xl text-white border-b border-slate-800 pb-2">Correction & Analysis</h3>
            {questions.map((q, idx) => {
              const studentAnswer = answers[idx];
              const isCorrect = studentAnswer === q.answer;
              return (
                <div key={idx} className={`p-6 rounded-lg border ${isCorrect ? 'border-green-900/50 bg-green-950/20' : 'border-red-900/50 bg-red-950/20'}`}>
                  <p className="text-slate-200 font-medium mb-4"><span className="text-slate-500 mr-2">{idx + 1}.</span> {q.q}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`p-2 rounded ${oIdx === q.answer ? 'bg-green-900/40 text-green-300 border border-green-800' : studentAnswer === oIdx ? 'bg-red-900/40 text-red-300 border border-red-800' : 'bg-slate-900 text-slate-500'}`}>
                        {opt} {oIdx === q.answer && "(Correct Answer)"} {studentAnswer === oIdx && !isCorrect && "(Your Answer)"}
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-950 p-4 rounded text-sm text-slate-400 border-l-4 border-cyan-800">
                    <strong className="text-cyan-500">Explanation:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={onExit} className="mt-12 w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded font-medium transition-colors">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col font-sans animate-fade-in">
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div>
          <h2 className="font-serif text-2xl text-white">Quasarized CBT</h2>
          <p className="text-sm text-slate-400">Subject: <span className="text-cyan-400 font-bold">{subject}</span> | Candidate: {studentName}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 text-xl font-bold font-mono px-4 py-2 rounded border ${timeLeft < 300 ? 'border-red-500 text-red-500 animate-pulse' : 'border-slate-700 text-cyan-400 bg-slate-950'}`}>
            <Clock size={24} /> {formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowSubmitModal(true)} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-medium transition-colors">Submit Exam</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col md:overflow-y-auto">
          <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-6">Question Navigation</h3>
          <div className="grid grid-cols-5 gap-2 mb-8">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = currentIndex === idx;
              return (
                <button 
                  key={idx} onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-all
                    ${isCurrent ? 'ring-2 ring-white scale-110 shadow-lg' : ''}
                    ${isAnswered ? 'bg-cyan-700 text-white border border-cyan-500' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-auto space-y-3 text-sm border-t border-slate-800 pt-6">
            <div className="flex justify-between text-cyan-400 font-medium"><span>Answered:</span> <span>{answeredCount}</span></div>
            <div className="flex justify-between text-slate-500"><span>Unanswered:</span> <span>{unansweredCount}</span></div>
            <div className="flex justify-between text-red-400 mt-4 border-t border-slate-800 pt-4"><span>Cheat Warnings:</span> <span>{cheatWarnings} / 3</span></div>
          </div>
        </div>

        <div className="flex-1 p-6 md:p-10 overflow-y-auto relative">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <span className="text-cyan-500 font-bold tracking-widest uppercase text-sm mb-2 block">Question {currentIndex + 1} of 50</span>
              <h2 className="font-serif text-2xl md:text-3xl text-white leading-relaxed">{questions[currentIndex].q}</h2>
            </div>
            <div className="space-y-4">
              {questions[currentIndex].options.map((option, idx) => {
                const isSelected = answers[currentIndex] === idx;
                return (
                  <button 
                    key={idx} onClick={() => handleSelectAnswer(idx)}
                    className={`w-full text-left p-4 md:p-6 rounded-xl border transition-all flex items-center gap-4 text-base md:text-lg
                      ${isSelected ? 'bg-cyan-900/40 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-cyan-400' : 'border-slate-500'}`}>
                      {isSelected && <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>}
                    </div>
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-12 flex justify-between items-center border-t border-slate-800 pt-8">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="px-4 md:px-6 py-3 rounded border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-800 transition-colors text-sm md:text-base">Previous</button>
              <button onClick={handleNext} disabled={currentIndex === questions.length - 1} className="px-6 md:px-8 py-3 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors text-sm md:text-base">Skip / Next</button>
            </div>
          </div>
        </div>
      </div>

      {showCheatModal && (
        <div className="fixed inset-0 bg-red-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border-2 border-red-600 p-8 md:p-10 rounded-xl max-w-lg text-center shadow-2xl">
            <AlertTriangle className="text-red-500 mx-auto mb-6" size={64} />
            <h2 className="font-serif text-3xl text-white mb-4">SECURITY WARNING</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              You navigated away from the examination window. This has been logged as a potential cheating attempt. 
              <br/><br/>Warning Count: <strong className="text-red-400">{cheatWarnings} of 3</strong>
            </p>
            {cheatWarnings >= 3 ? (
              <button onClick={handleFinalSubmit} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded font-medium">Auto-Submit Examination</button>
            ) : (
              <button onClick={() => setShowCheatModal(false)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded font-medium">Acknowledge & Return</button>
            )}
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 p-8 md:p-10 rounded-xl max-w-lg text-center shadow-2xl">
            <h2 className="font-serif text-3xl text-white mb-4">Submit Examination?</h2>
            {unansweredCount > 0 ? (
              <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded mb-8">
                <p className="text-yellow-400 font-medium flex items-center justify-center gap-2"><AlertTriangle size={18} /> You have {unansweredCount} unanswered questions.</p>
                <p className="text-sm text-yellow-200 mt-2">Are you sure you want to submit before answering everything?</p>
              </div>
            ) : (
              <p className="text-slate-300 mb-8">You have answered all 50 questions. Are you ready to see your final score?</p>
            )}
            <div className="flex gap-4">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 border border-slate-600 hover:bg-slate-800 text-white py-3 rounded font-medium transition-colors">No, Return</button>
              <button onClick={handleFinalSubmit} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded font-medium transition-colors">Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN REUSABLE COMPONENTS
// ============================================================================
const DrugCard = ({ name, classType, interaction, severity, clinicalNote }) => (
  <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg hover:border-cyan-500 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-serif text-2xl text-cyan-400">{name}</h3>
        <p className="text-sm text-slate-400 font-sans uppercase tracking-widest mt-1">{classType}</p>
      </div>
      <ShieldAlert className={severity === 'High' ? 'text-red-500' : 'text-yellow-500'} size={24} />
    </div>
    <div className="space-y-3 font-sans text-slate-300">
      <p><strong className="text-white">Primary Interaction:</strong> {interaction}</p>
      <p><strong className="text-white">Clinical Note:</strong> {clinicalNote}</p>
    </div>
  </div>
);

// NEW: Smarter Video Section that parses YouTube links cleanly
const VideoSection = ({ title, url, description }) => {
  let videoId = "";
  if (url && url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  } else if (url && url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1]?.split("&")[0];
  }
  
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-800 transition-colors">
      <h3 className="font-serif text-2xl text-white mb-3">{title}</h3>
      <p className="font-sans text-slate-400 mb-6 text-sm leading-relaxed">{description}</p>
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
        {embedUrl ? (
          <iframe 
            src={embedUrl} title={title} className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
          ></iframe>
        ) : (
          <div className="text-slate-600 flex flex-col items-center gap-2">
            <PlayCircle size={40} className="opacity-50" />
            <p className="text-sm">Video link not yet provided</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FullArticleDisplay = ({ article }) => (
  <article className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-12 shadow-lg shadow-cyan-900/10">
    <div className="w-full h-72 md:h-[32rem] relative overflow-hidden bg-slate-950 flex justify-center items-center">
      <img src={article.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-110" />
      <img src={article.thumbnail} alt={article.caseTitle} className="relative w-full h-full object-contain opacity-95 z-10 p-4" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-20"></div>
      <div className="absolute bottom-6 left-6 right-6 z-30">
        <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-2 block drop-shadow-md">{article.subjectName}</span>
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight drop-shadow-lg">{article.caseTitle}</h2>
      </div>
    </div>
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-8 bg-slate-950 p-4 rounded-lg border border-slate-800">
        <ShieldAlert className="text-cyan-500" size={20} />
        <span><strong className="text-slate-200">Primary Chemical/Toxin:</strong> {article.primaryToxin}</span>
      </div>
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg font-light">
        {article.clinicalBreakdown && article.clinicalBreakdown.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </div>
  </article>
);


// ============================================================================
// MAIN APPLICATION ROUTER
// ============================================================================
export default function Quasarized() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeArticle, setActiveArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [activeCBTSubject, setActiveCBTSubject] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setIsLoggedIn(true);
        try {
          const userDoc = await getDoc(doc(db, "students", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching profile data", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthSuccess('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "students", user.uid), {
        fullName: user.displayName,
        email: user.email,
        registrationDate: serverTimestamp(),
        role: "student"
      }, { merge: true });

    } catch (error) {
      setAuthError("Google Sign-In failed or was cancelled.");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (isLoginMode) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setAuthError('Please verify your email address before accessing the portal. Check your inbox or spam folder.');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "students", user.uid), {
          fullName: fullName,
          email: email,
          registrationDate: serverTimestamp(),
          role: "student"
        });

        await sendEmailVerification(user);
        await signOut(auth);
        
        setAuthSuccess('Registration successful! A verification link has been sent to your email. You must verify your account before logging in.');
        setFullName('');
        setPassword('');
        setEmail('');
      }
    } catch (error) {
      let friendlyMessage = "An unexpected error occurred. Please try again later.";
      switch (error.code) {
        case 'auth/invalid-credential': case 'auth/wrong-password': case 'auth/user-not-found':
          friendlyMessage = "Incorrect email or password. Please check your credentials."; break;
        case 'auth/email-already-in-use':
          friendlyMessage = "An account with this email address already exists. Please log in instead."; break;
        case 'auth/weak-password':
          friendlyMessage = "Your password is too weak. It must be at least 6 characters long."; break;
        case 'auth/invalid-email':
          friendlyMessage = "Please enter a valid email address."; break;
        default:
          friendlyMessage = error.message.replace('Firebase: ', '');
      }
      setAuthError(friendlyMessage);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveCBTSubject(null);
  };

  const navigateTo = (tab, article = null) => {
    setActiveTab(tab);
    setActiveArticle(article);
    setActiveCBTSubject(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppRedirect = (courseTitle) => {
    const message = `Hello Management, I would like to register for the ${courseTitle} class. My name is ${userData?.fullName || 'a student'}.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/2347061515950?text=${encodedMessage}`, '_blank');
  };

  const startCBT = (subject) => {
    if (subject === "Biology") {
      setActiveCBTSubject(subject);
    } else {
      alert(`The ${subject} question bank is currently being updated. Please check back later.`);
    }
  };

  const renderContent = () => {
    
    if (activeCBTSubject === "Biology") {
      return (
        <CBTEngine 
          studentName={userData?.fullName || "Student"} 
          questions={biologyQuestions} 
          subject={activeCBTSubject}
          onExit={() => setActiveCBTSubject(null)} 
        />
      );
    }

    if (activeArticle) {
      if (activeTab === 'blog') {
        const relatedPosts = dailyBlogPosts.filter(p => p.id !== activeArticle.id).slice(0, 2);
        return (
          <main className="py-16 max-w-4xl mx-auto px-6 animate-fade-in">
            <button onClick={() => navigateTo('blog')} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-medium transition-colors">
              <ArrowLeft size={20} /> Back to News & Updates
            </button>
            <article className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-12 p-8 shadow-lg">
              <h1 className="font-serif text-4xl text-white mb-8">{activeArticle.title}</h1>
              <div className="space-y-6 text-slate-300 font-light">
                {activeArticle.content && activeArticle.content.map((paragraph, idx) => (<p key={idx}>{paragraph}</p>))}
              </div>
            </article>
          </main>
        );
      }
      return (
        <main className="py-16 max-w-4xl mx-auto px-6 animate-fade-in">
          <button onClick={() => navigateTo('cases')} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-medium transition-colors">
            <ArrowLeft size={20} /> Back to Cases Hub
          </button>
          <FullArticleDisplay article={activeArticle} />
        </main>
      );
    }

    switch(activeTab) {
      case 'home':
        return (
          <main className="animate-fade-in">
            <section className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-8 z-10">
                <h2 className="font-serif text-cyan-400 text-lg tracking-widest uppercase">The Forensic Pharmacist</h2>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight">
                  Decoding the ‘Silent Killers’ in Your Medicine Cabinet.
                </h1>
                <p className="text-xl text-slate-300 font-light leading-relaxed max-w-2xl border-l-4 border-cyan-500 pl-4">
                  Forensic and DNA Insights from Israel Mordechai bridging clinical pharmacy and death investigation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {/* NEW: Scroll to Multimedia button */}
                  <button onClick={() => {
                    const multimediaSection = document.getElementById('youtube-multimedia');
                    if (multimediaSection) {
                      multimediaSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigateTo('cases');
                    }
                  }} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded font-medium transition-all flex items-center justify-center gap-2">
                    <PlayCircle size={20} /> Watch the Case Studies
                  </button>

                  {/* NEW: Direct WhatsApp Booking Link */}
                  <button onClick={() => {
                    const message = "Hello Israel, I would like to book a professional consultation.";
                    window.open(`https://wa.me/2347061515950?text=${encodeURIComponent(message)}`, '_blank');
                  }} className="border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 text-slate-300 px-8 py-4 rounded font-medium transition-all">
                    Book a Consultation
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full max-w-md flex flex-col items-center">
                <h3 className="font-serif text-3xl font-bold text-white mb-2">Israel Mordechai Ejike Orizu</h3>
                <p className="text-cyan-400 font-sans tracking-widest text-sm mb-6">QUASAR</p>
                <div className="relative w-full aspect-[3/4] bg-slate-900 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                      backgroundImage: 'url(/israel-profile.jpg)',
                      backgroundColor: '#1e293b',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
                    }}
                  />
                </div>
                <p className="text-center text-slate-400 text-sm mt-6 max-w-sm">
                  Clinical Pharmacist in training, Educator, and Forensic Analyst. Dedicated to evidence-based interventions and toxicology education.
                </p>
              </div>
            </section>

            <section className="border-y border-slate-800 bg-slate-900/50 py-8">
              <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-sm font-sans tracking-widest text-slate-500 mb-6 uppercase">Professional Affiliations</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-slate-400 font-serif items-center text-lg">
                  <span className="hover:text-white transition-colors">Lumaco Pharmacy</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="hover:text-white transition-colors">TRCN Registered</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="hover:text-white transition-colors">University of Benin</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="hover:text-white transition-colors">Center for Forensics & DNA</span>
                </div>
              </div>
            </section>

            <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div onClick={() => navigateTo('cases')} className="cursor-pointer p-8 border border-slate-800 bg-slate-900/30 rounded-xl hover:bg-slate-900 transition-colors">
                <Activity className="text-cyan-400 mb-6" size={40} />
                <h3 className="font-serif text-2xl text-white mb-4">Clinical Risk</h3>
                <p className="text-slate-400 leading-relaxed">
                  Comprehensive analysis of Herb-Drug interactions. Understanding how natural remedies alter pharmacological efficacy and safety profiles.
                </p>
              </div>
              <div onClick={() => navigateTo('cases')} className="cursor-pointer p-8 border border-slate-800 bg-slate-900/30 rounded-xl hover:bg-slate-900 transition-colors">
                <Microscope className="text-cyan-400 mb-6" size={40} />
                <h3 className="font-serif text-2xl text-white mb-4">Forensic Case Files</h3>
                <p className="text-slate-400 leading-relaxed">
                  Detailed toxicology breakdowns. Investigating the chemical catalysts behind high-profile medical and forensic anomalies.
                </p>
              </div>
              <div onClick={() => navigateTo('educators-lab')} className="cursor-pointer p-8 border border-slate-800 bg-slate-900/30 rounded-xl hover:bg-slate-900 transition-colors">
                <BookOpen className="text-cyan-400 mb-6" size={40} />
                <h3 className="font-serif text-2xl text-white mb-4">Educator’s Lab</h3>
                <p className="text-slate-400 leading-relaxed">
                  Curated medical and student resources. Online registration, private tutoring, and standardized Computer Based Testing (CBT).
                </p>
              </div>
            </section>

            <section className="py-16 bg-slate-900 border-t border-slate-800">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div>
                    <h2 className="font-serif text-4xl text-white mb-4">The Content Hub</h2>
                    <p className="text-slate-400 max-w-xl">Search the database for specific interactions or review recent forensic breakdowns.</p>
                  </div>
                  <div className="relative w-full md:w-96">
                    <input 
                      type="text" placeholder="Search 'Silent Killers' database..." 
                      className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 pl-12 rounded focus:outline-none focus:border-cyan-500 transition-colors"
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
                  </div>
                </div>

                <div className="mb-16">
                  <h3 className="font-sans font-bold text-slate-500 tracking-widest uppercase text-sm mb-6 border-b border-slate-800 pb-2">The Silent Killers Series</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DrugCard 
                      name="Warfarin & St. John's Wort" classType="Anticoagulant Interaction"
                      interaction="St. John's Wort induces CYP3A4 enzymes, rapidly decreasing Warfarin plasma concentrations."
                      severity="High" clinicalNote="Results in sub-therapeutic anticoagulation, increasing the risk of thromboembolic events."
                    />
                    <DrugCard 
                      name="Digoxin & Licorice Root" classType="Cardiac Glycoside Interaction"
                      interaction="Licorice causes hypokalemia, increasing the myocardium's sensitivity to Digoxin."
                      severity="High" clinicalNote="Can precipitate severe, potentially fatal cardiac arrhythmias even at normal Digoxin doses."
                    />
                    <DrugCard 
                      name="Statins & Grapefruit Juice" classType="Metabolic Inhibition"
                      interaction="Furanocoumarins in grapefruit inhibit intestinal CYP3A4, increasing statin bioavailability."
                      severity="Moderate" clinicalNote="Elevated serum levels significantly increase the risk of statin-induced myopathy and rhabdomyolysis."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* NEW: Restored YouTube Multimedia Section */}
            <section id="youtube-multimedia" className="py-20 bg-slate-950 border-t border-slate-800">
              <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12">
                  <h2 className="font-sans text-cyan-400 tracking-widest uppercase text-sm mb-4 font-bold">Multimedia</h2>
                  <h1 className="font-serif text-4xl text-white mb-4">YouTube Case Studies.</h1>
                  <p className="text-slate-400 max-w-2xl">Watch detailed video breakdowns of forensic cases, DNA analyses, and pharmacological interactions.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* EDIT THE URLs HERE TO YOUR ACTUAL YOUTUBE VIDEOS */}
                  <VideoSection 
                    title="The Bleeding Truth: Warfarin & Garlic" 
                    url="YOUR_YOUTUBE_LINK_HERE" 
                    description="A clinical breakdown of why natural supplements can be fatal when mixed with anticoagulants." 
                  />
                  <VideoSection 
                    title="Forensics: The Village People vs. Vials" 
                    url="YOUR_YOUTUBE_LINK_HERE" 
                    description="Investigating Organophosphate Poisoning and uncovering the chemical truth behind superstitions." 
                  />
                </div>
              </div>
            </section>
          </main>
        );

      case 'educators-lab':
        if (!isLoggedIn) {
          return (
            <main className="py-24 max-w-lg mx-auto px-6 animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center mb-6 border border-cyan-800">
                <Lock className="text-cyan-400" size={32} />
              </div>
              <h1 className="font-serif text-4xl text-white mb-2">{isLoginMode ? "Student Portal" : "Student Registration"}</h1>
              <p className="text-slate-400 text-center mb-10">Access the Educator's Lab, register for classes, and participate in standardized CBT assessments.</p>

              <div className="w-full bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl">
                {authError && (
                  <div className="mb-6 p-3 bg-red-900/40 border border-red-800 text-red-300 text-sm rounded flex items-start gap-2 animate-fade-in">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" /> <p>{authError}</p>
                  </div>
                )}
                {authSuccess && (
                  <div className="mb-6 p-3 bg-green-900/40 border border-green-800 text-green-300 text-sm rounded flex items-start gap-2 animate-fade-in">
                    <CheckCircle size={16} className="mt-0.5 shrink-0" /> <p>{authSuccess}</p>
                  </div>
                )}

                <form onSubmit={handleAuth}>
                  {!isLoginMode && (
                    <div className="mb-6">
                      <label className="block text-sm font-sans tracking-widest text-slate-400 uppercase mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3 text-slate-500" size={18} />
                        <input type="text" placeholder="Israel Orizu" value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLoginMode} className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 pl-12 rounded focus:outline-none focus:border-cyan-500" />
                      </div>
                    </div>
                  )}
                  <div className="mb-6">
                    <label className="block text-sm font-sans tracking-widest text-slate-400 uppercase mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3 text-slate-500" size={18} />
                      <input type="email" placeholder="student@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 pl-12 rounded focus:outline-none focus:border-cyan-500" />
                    </div>
                  </div>
                  <div className="mb-8">
                    <label className="block text-sm font-sans tracking-widest text-slate-400 uppercase mb-2">Password (Min 6 Characters)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3 text-slate-500" size={18} />
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 pl-12 pr-12 rounded focus:outline-none focus:border-cyan-500" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-slate-500 hover:text-cyan-400 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded flex justify-center items-center gap-2 mb-4"><LogIn size={18} /> {isLoginMode ? "Secure Login" : "Create Account"}</button>
                </form>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-slate-800"></div><span className="text-slate-500 text-sm font-sans uppercase tracking-widest">OR</span><div className="flex-1 h-px bg-slate-800"></div>
                </div>

                <button onClick={handleGoogleSignIn} className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-300 font-medium py-3 rounded flex justify-center items-center gap-3 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
                  Continue with Google
                </button>
                <p className="text-center text-sm text-slate-500">
                  {isLoginMode ? "Don't have a student account? " : "Already a registered student? "}
                  <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); setAuthSuccess(''); }} className="text-cyan-400 hover:underline">
                    {isLoginMode ? "Register here." : "Log in here."}
                  </button>
                </p>
              </div>
            </main>
          );
        }

        return (
          <main className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
              <div>
                <h2 className="font-sans text-cyan-400 tracking-widest uppercase text-sm mb-4 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Authorized Access
                </h2>
                <h1 className="font-serif text-5xl text-white mb-2">Educator's Dashboard.</h1>
                <h2 className="font-sans text-2xl text-slate-400 mb-6">Welcome back, <span className="text-white font-medium">{userData?.fullName || "Student"}</span>.</h2>
                <p className="text-lg text-slate-300 max-w-2xl">
                  Select a course to register directly via management, or begin your standardized CBT assessment below.
                </p>
              </div>
              <button onClick={handleLogout} className="border border-slate-700 hover:border-red-500 hover:text-red-400 text-slate-400 px-6 py-2 rounded text-sm transition-colors">
                Secure Logout
              </button>
            </div>

            <div className="mb-20">
              <h3 className="font-serif text-3xl text-white mb-8 border-b border-slate-800 pb-4 flex items-center gap-3">
                <BookOpen className="text-cyan-400" /> Academic & Skill Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-800 transition-colors flex flex-col">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-3 block">{course.type}</span>
                    <h4 className="font-serif text-2xl text-white mb-4">{course.title}</h4>
                    <p className="text-slate-400 text-sm mb-8 flex-grow">Registration handled directly by Quasar Management to ensure personalized placement.</p>
                    <button onClick={() => handleWhatsAppRedirect(course.title)} className="w-full bg-slate-950 border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 text-slate-300 py-3 rounded font-medium flex justify-center items-center gap-2 transition-all">
                      <MessageCircle size={18} /> Register for Class
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-3xl text-white mb-8 border-b border-slate-800 pb-4 flex items-center gap-3">
                <Activity className="text-cyan-400" /> Computer Based Testing (CBT)
              </h3>
              <p className="text-slate-400 mb-8 max-w-3xl">
                Standardized mock examinations. Select Biology to test the engine. Other subjects are currently locked.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cbtSubjects.map((subject, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => startCBT(subject)} 
                    className={`border p-4 rounded-lg text-center transition-all font-medium text-sm flex flex-col items-center justify-center gap-3 h-28
                      ${subject === "Biology" ? 'bg-slate-900 border-cyan-700 hover:bg-slate-800 hover:border-cyan-400 text-white cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'}`}
                  >
                    {subject === "Biology" ? <FileText className="text-cyan-400" size={24} /> : <Lock className="text-slate-600" size={24} />}
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </main>
        );

      case 'cases':
        const featClinical = clinicalRiskArticles.slice(0, 2);
        const remClinical = clinicalRiskArticles.slice(2);
        const featForensic = forensicCaseFiles.slice(0, 2);
        const remForensic = forensicCaseFiles.slice(2);

        return (
          <main className="py-16 max-w-5xl mx-auto px-6 animate-fade-in">
            <div className="mb-16 text-center">
              <h2 className="font-sans text-cyan-400 tracking-widest uppercase text-sm mb-4 font-bold">The Archives</h2>
              <h1 className="font-serif text-5xl text-white mb-6">Clinical & Forensic Cases.</h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Comprehensive databases detailing herb-drug interactions, chemical catalysts, and high-profile death investigations.
              </p>
            </div>

            <div className="mb-20">
              <h2 className="font-serif text-3xl text-cyan-400 mb-8 border-b border-slate-800 pb-4 flex items-center gap-3">
                <Activity size={28} /> Clinical Risk Database
              </h2>
              <div className="space-y-4">
                {featClinical.map(article => <FullArticleDisplay key={article.id} article={article} />)}
              </div>
              {remClinical.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {remClinical.map(article => (
                    <div key={article.id} onClick={() => navigateTo('cases', article)} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer group flex flex-col">
                      <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-2">{article.subjectName}</span>
                      <h4 className="font-serif text-2xl text-white mb-3 group-hover:text-cyan-100 transition-colors">{article.caseTitle}</h4>
                      <button className="text-cyan-400 font-medium flex items-center gap-2 mt-auto">Read Analysis <ChevronRight size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-serif text-3xl text-cyan-400 mb-8 border-b border-slate-800 pb-4 flex items-center gap-3">
                <Microscope size={28} /> Forensic Case Files
              </h2>
              <div className="space-y-4">
                {featForensic.map(article => <FullArticleDisplay key={article.id} article={article} />)}
              </div>
              {remForensic.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {remForensic.map(article => (
                    <div key={article.id} onClick={() => navigateTo('cases', article)} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer group flex flex-col">
                      <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-2">{article.subjectName}</span>
                      <h4 className="font-serif text-2xl text-white mb-3 group-hover:text-cyan-100 transition-colors">{article.caseTitle}</h4>
                      <button className="text-cyan-400 font-medium flex items-center gap-2 mt-auto">Read Analysis <ChevronRight size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        );

      case 'services':
        return (
          <main className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
            <div className="max-w-3xl mb-16">
              <h2 className="font-sans text-cyan-400 tracking-widest uppercase text-sm mb-4 font-bold">Consulting & Practice</h2>
              <h1 className="font-serif text-5xl text-white mb-6">Professional Services.</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Leveraging comprehensive training in clinical pharmacy, forensic DNA analysis, and emergency response to provide specialized consulting and educational services.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl">
                <Fingerprint className="text-cyan-400 mb-6" size={48} />
                <h3 className="font-serif text-2xl text-white mb-4">Pharmacogenomic & DNA Profiling</h3>
                <p className="text-slate-400 mb-6">Expert analysis on how specific genetic markers influence drug metabolism. This service assists clinicians in avoiding adverse drug reactions and optimizing therapeutic outcomes based on individual DNA profiles.</p>
                <button className="text-cyan-400 font-medium flex items-center gap-2 hover:text-cyan-300 transition-colors">Request Consultation <ChevronRight size={16} /></button>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl">
                <Stethoscope className="text-cyan-400 mb-6" size={48} />
                <h3 className="font-serif text-2xl text-white mb-4">Forensic Toxicology Audits</h3>
                <p className="text-slate-400 mb-6">Detailed review and interpretation of toxicological reports for legal and clinical investigations. Identifying the presence of chemical catalysts and silent killers in complex morbidity cases.</p>
                <button className="text-cyan-400 font-medium flex items-center gap-2 hover:text-cyan-300 transition-colors">Review Case Files <ChevronRight size={16} /></button>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl">
                <HeartPulse className="text-cyan-400 mb-6" size={48} />
                <h3 className="font-serif text-2xl text-white mb-4">BLS & Medical Response Training</h3>
                <p className="text-slate-400 mb-6">Certified instruction in Basic Life Support and Automated External Defibrillator utilization. Combining over ten years of educational experience with practical emergency medical protocols.</p>
                <button className="text-cyan-400 font-medium flex items-center gap-2 hover:text-cyan-300 transition-colors">Schedule Training <ChevronRight size={16} /></button>
              </div>
            </div>
          </main>
        );

      case 'blog':
        return (
          <main className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
            <div className="max-w-3xl mb-16">
              <h2 className="font-sans text-cyan-400 tracking-widest uppercase text-sm mb-4 font-bold">The Daily Mortar</h2>
              <h1 className="font-serif text-5xl text-white mb-6">News & Updates.</h1>
              <p className="text-lg text-slate-300 leading-relaxed">Daily commentary on emerging trends in clinical pharmacy, forensic toxicology, and DNA diagnostics.</p>
            </div>
            <div className="space-y-8">
              {dailyBlogPosts.map((post) => (
                <article key={post.id} className="bg-slate-900 border border-slate-800 p-8 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 text-sm font-sans">
                    <span className="text-cyan-400 font-bold uppercase tracking-widest">{post.category}</span>
                    <span className="hidden md:inline text-slate-600">|</span>
                    <span className="text-slate-400">{post.date}</span>
                    <span className="hidden md:inline text-slate-600">|</span>
                    <span className="text-slate-500 flex items-center gap-1"><FileText size={14}/> {post.readTime}</span>
                  </div>
                  <h3 className="font-serif text-3xl text-white mb-4">{post.title}</h3>
                  <p className="text-slate-300 leading-relaxed mb-6">{post.excerpt}</p>
                  <button onClick={() => navigateTo('blog', post)} className="text-cyan-400 font-medium flex items-center gap-2 hover:text-cyan-300 transition-colors">Read Full Article <ChevronRight size={16} /></button>
                </article>
              ))}
            </div>
          </main>
        );

      case 'artists':
        return (
          <main className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
            <div className="max-w-3xl mb-16">
              <h2 className="font-sans text-cyan-400 tracking-widest uppercase text-sm mb-4 font-bold">Audio Production & Promotion</h2>
              <h1 className="font-serif text-5xl text-white mb-6">Label & Production.</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Beyond the laboratory, I provide exclusive music promotion, audio production, and visualizer design for a select roster of artists. 
                These individuals are the next big names in the music industry. Their distinct rhythms have consistently topped charts on platforms like Deezer, bringing fresh energy to the global Afrobeat scene.
              </p>
            </div>
            <div className="space-y-16">
              {artists.map((artist, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-8 items-center bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-800 transition-all">
                  <div className="w-full md:w-1/3 aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-4xl text-white mb-2">{artist.name}</h3>
                    <p className="text-slate-400 mb-6 font-sans">Exclusive Record Label Signee & Promoted Artist.</p>
                    <div className="space-y-4">
                      <h4 className="font-sans text-sm tracking-widest text-cyan-400 uppercase">Stream on Platforms</h4>
                      <div className="flex flex-wrap gap-4">
                        {artist.links.map((link, lIdx) => (
                          <a key={lIdx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-4 py-2 rounded text-slate-300 hover:text-white hover:border-cyan-500 transition-colors">
                            <Music size={16} /> {link.name} <ExternalLink size={14} className="ml-1 opacity-50" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-900 selection:text-white">
      {activeCBTSubject !== "Biology" && (
        <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-sm flex items-center justify-center font-serif font-bold text-white text-xl">Q</div>
              <span className="font-serif text-2xl font-bold tracking-wide text-white">Quasarized</span>
            </div>
            <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
              <button onClick={() => navigateTo('home')} className={`hover:text-cyan-400 transition-colors ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-300'}`}>Home</button>
              <button onClick={() => navigateTo('services')} className={`hover:text-cyan-400 transition-colors ${activeTab === 'services' ? 'text-cyan-400' : 'text-slate-300'}`}>Professional Services</button>
              <button onClick={() => navigateTo('blog')} className={`hover:text-cyan-400 transition-colors ${activeTab === 'blog' ? 'text-cyan-400' : 'text-slate-300'}`}>News & Updates</button>
              <button onClick={() => navigateTo('artists')} className={`hover:text-cyan-400 transition-colors ${activeTab === 'artists' ? 'text-cyan-400' : 'text-slate-300'}`}>Label & Production</button>
              <button onClick={() => navigateTo('educators-lab')} className={`hover:text-cyan-400 transition-colors ${activeTab === 'educators-lab' ? 'text-cyan-400' : 'text-slate-300'}`}>Educator's Lab</button>
            </nav>
          </div>
        </header>
      )}

      {renderContent()}

      {activeCBTSubject !== "Biology" && (
        <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 px-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center rounded font-serif font-bold text-white text-2xl shadow-lg shadow-cyan-900/20">Q</div>
              <div className="text-center md:text-left">
                <h3 className="font-serif text-2xl text-white">Quasarized</h3>
                <p className="font-sans text-slate-400 mt-1">Israel Mordechai Ejike Orizu</p>
              </div>
            </div>
            <div className="flex gap-6">
              <a href="https://wa.me/2347061515950" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-green-400 hover:bg-green-900/20 hover:border-green-500 transition-all shadow-lg cursor-pointer"><MessageCircle size={24} /></a>
              <a href="mailto:Quasarized@gmail.com" className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-red-400 hover:bg-red-900/20 hover:border-red-500 transition-all shadow-lg cursor-pointer"><Mail size={24} /></a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto text-center border-t border-slate-900 mt-12 pt-8 text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} Quasarized. All professional rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}