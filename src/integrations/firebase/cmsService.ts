import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "./config";

export interface HeroContent {
  badgeText: string;
  titlePrefix: string;
  titleGradient: string;
  titleSuffix: string;
  description: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  deliverables: string[];
}

export interface CaseStudyItem {
  id: string;
  title: string;
  student: string;
  institution: string;
  discipline: string;
  grade: string;
  quote: string;
  tags: string[];
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export interface CMSData {
  hero: HeroContent;
  services: ServiceItem[];
  caseStudies: CaseStudyItem[];
  howItWorks: HowItWorksStep[];
  reviewsHeading: {
    badge: string;
    title: string;
    subtitle: string;
  };
}

export const defaultCMSData: CMSData = {
  hero: {
    badgeText: "🚀 We Build Your Project, You Focus on Your Degree.",
    titlePrefix: "Your Final Year Project,",
    titleGradient: "Built to Perfection",
    titleSuffix: "No Stress.",
    description:
      "BuildWave helps undergraduates, masters, PhD students and anyone complete projects from topic selection to full implementation. Need to bring your project and ideas to life? You're in the right place.",
    ctaPrimaryText: "Get Started",
    ctaSecondaryText: "Browse Services",
    stat1Value: "200+",
    stat1Label: "Students",
    stat2Value: "4.9/5",
    stat2Label: "Student Rating",
    stat3Value: "100%",
    stat3Label: "Delivered",
  },
  services: [
    {
      id: "ai-ml",
      title: "AI & Machine Learning",
      description: "Custom ML models, neural networks, and intelligent systems.",
      badge: "Computer Science",
      deliverables: ["Undergraduate", "Masters", "PhD"],
    },
    {
      id: "iot-embedded",
      title: "IoT & Embedded Systems",
      description: "Smart devices, Arduino, ESP32, Raspberry Pi, and sensor networks.",
      badge: "Electrical Engineering",
      deliverables: ["Undergraduate", "Masters", "PhD"],
    },
    {
      id: "research-thesis",
      title: "Research & Thesis Writing",
      description: "Literature review, methodology, data analysis, and full thesis.",
      badge: "All Disciplines",
      deliverables: ["Undergraduate", "Masters", "PhD"],
    },
    {
      id: "web-mobile",
      title: "Web & Mobile Development",
      description: "Full-stack applications, mobile apps, and responsive websites.",
      badge: "Software Engineering",
      deliverables: ["Undergraduate", "Masters", "PhD", "StartUps"],
    },
    {
      id: "data-science",
      title: "Data Science & Analytics",
      description: "Data mining, visualization, predictive modeling, and insights.",
      badge: "Data Science",
      deliverables: ["Undergraduate", "Masters", "PhD"],
    },
    {
      id: "research-methodology",
      title: "Research Methodology",
      description: "Experimental design, statistical analysis, and research frameworks.",
      badge: "All Disciplines",
      deliverables: ["PhD"],
    },
    {
      id: "cad-modeling",
      title: "CAD & 3D Modeling",
      description: "Product design, simulations, and 3D printing models.",
      badge: "Engineering Design",
      deliverables: ["Undergraduate", "Masters", "PhD"],
    },
    {
      id: "circuit-design",
      title: "Electrical Circuit Design",
      description: "PCB design, circuit simulations, and embedded systems.",
      badge: "Electrical Engineering",
      deliverables: ["Undergraduate", "Masters", "PhD"],
    },
    {
      id: "consultancy",
      title: "Consultancy Services",
      description: "Project planning, technical guidance, and expert advice.",
      badge: "All Disciplines",
      deliverables: ["Undergraduate", "Masters", "PhD"],
    }
  ],
  caseStudies: [
    {
      id: "cs-1",
      title: "CNN Based Tomatoes Leaf Disease Detection for Smart Agriculture",
      student: "Chidinma O., MSc Computer Engineering",
      institution: "Michel Okpara University of Agriculture, Umudike",
      discipline: "Computer Engineering",
      grade: "Achieved 92% accuracy in disease detection",
      quote: "ML Based system using convolutional neural networks to identify and classify 10 different tomato leaf diseases in real-time for screening and treatment recommendations with real time LLM Chat integration",
      tags: ["CNN", "LLM", "Smart Agriculture"],
    },
    {
      id: "cs-2",
      title: "Text to speech system using Groq playaitts",
      student: "Ochulor Chibuzor Daniel, BSc Computer Science",
      institution: "Micheal Okpara University of Agriculture, Umudike",
      discipline: "Computer Science",
      grade: "Up to 95% natural-sounding speech generation and 15 voices",
      quote: "Text-to-speech application leveraging Groq PlayAITTS for high-quality, natural-sounding speech synthesis from text input",
      tags: ["Groq PlayAITTS", "TTS"],
    },
    {
      id: "cs-3",
      title: "E-Commerce Platform with Analytics",
      student: "Tunde O., Final Year CS",
      institution: "University of Lagos",
      discipline: "Computer Science",
      grade: "Won Best Project Award",
      quote: "Full-stack e-commerce solution with real-time analytics, payment integration, and inventory management",
      tags: ["E-Commerce", "Analytics"],
    },
    {
      id: "cs-4",
      title: "Whisper-net: ICP blockChain based Secure End to End Encryption Messaging App",
      student: "Igbariam Kosi, MSc Computer Engineering",
      institution: "University of Nigeria, Nsukka",
      discipline: "Computer Engineering",
      grade: "Enhanced security with zero data breaches",
      quote: "Blockchain-based messaging app ensuring secure end-to-end encryption using ICP technology for enhanced privacy and data integrity",
      tags: ["Blockchain", "ICP", "Encryption"],
    },
    {
      id: "cs-5",
      title: "IOT Based Speech to Text For the Hearing Impaired",
      student: "Chikwendu Chidindu treasure, BSc Computer Engineering",
      institution: "Micheal Okpara University of Agriculture, Umudike",
      discipline: "Computer Engineering",
      grade: "Real-time transcription with 90% accuracy",
      quote: "Internet of Things (IoT) based speech-to-text system for the hearing impaired, enabling real-time transcription of spoken language",
      tags: ["IoT", "STT"],
    },
    {
      id: "cs-6",
      title: "Servo controlled Robotic Arm DIY Robotic Arm",
      student: "Emmanuel Tigo, BSc Computer Engineering",
      institution: "Micheal Okpara University of Agriculture, Umudike",
      discipline: "Computer Engineering",
      grade: "Achieved 95% precision in movement tasks",
      quote: "Custom laser-cutting built robotic arm with precise control and programmable movements for educational and research purposes",
      tags: ["Robotics", "DIY"],
    },
    {
      id: "cs-7",
      title: "IOT Based Smart Locker For Effective Parcel Delivery",
      student: "David, BSc Computer Engineering",
      institution: "Micheal Okpara University of Agriculture, Umudike",
      discipline: "Computer Engineering",
      grade: "Enhanced security with 99% delivery accuracy",
      quote: "Internet of Things (IoT) based smart locker system for secure and efficient parcel delivery with real-time tracking and notification",
      tags: ["IoT", "Smart Locker"],
    },
    {
      id: "cs-8",
      title: "Voice Controlled Home Automation System Using Arduino",
      student: "PrinceGeorge Ikechukwu, Final Year BSc Computer Engineering",
      institution: "Micheal Okpara University of Agriculture, Umudike",
      discipline: "Computer Engineering",
      grade: "Achieved 90% accuracy in voice commands",
      quote: "Voice-controlled home automation system using Arduino for smart home management",
      tags: ["Arduino", "IoT", "Voice Control"],
    },
    {
      id: "cs-9",
      title: "Anti-Sleep Alarm System for Drivers Using Eye-Tracking Technology",
      student: "Ogbonnaya IheanyiChukwu, BSc Computer Engineering",
      institution: "Micheal Okpara University of Agriculture, Umudike",
      discipline: "Computer Engineering",
      grade: "Reduced drowsiness-related incidents by 80%",
      quote: "An anti-sleep alarm system for drivers using eye-tracking technology to monitor alertness and prevent accidents",
      tags: ["Eye-Tracking", "Computer Vision"],
    }
  ],
  howItWorks: [
    {
      step: "01",
      title: "Tell Us What You Need",
      description: "Share your project requirements or request topic suggestions tailored to your course.",
    },
    {
      step: "02",
      title: "We Build It",
      description: "Our expert team works on your project while you track progress in real-time.",
    },
    {
      step: "03",
      title: "Receive & Excel",
      description: "Get your completed project with documentation and support for your presentation.",
    },
  ],
  reviewsHeading: {
    badge: "Student Wall of Love",
    title: "What Students Say",
    subtitle: "Join hundreds of successful students who trusted BuildWave.",
  },
};

/**
 * Fetch dynamic CMS section or return fallback default data.
 * Always returns defaultCMSData if Firestore read fails or doc doesn't exist.
 */
export const getCMSSection = async <K extends keyof CMSData>(section: K): Promise<CMSData[K]> => {
  try {
    const docRef = doc(db, "cms_content", section);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().content) {
      return snap.data().content as CMSData[K];
    }
  } catch (error) {
    // Silently fall back to defaults — Firestore read may fail due to rules
    console.warn(`CMS read failed for "${section}", using defaults:`, error);
  }
  return defaultCMSData[section];
};

/**
 * Save CMS section data to Firestore.
 * Uses setDoc with merge to avoid permission issues on partial updates.
 * Includes detailed error messages for common Firestore permission problems.
 */
export const updateCMSSection = async <K extends keyof CMSData>(section: K, data: CMSData[K]): Promise<void> => {
  // Check if user is authenticated first
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("You must be logged in to update CMS content. Please log in again.");
  }

  try {
    const docRef = doc(db, "cms_content", section);
    await setDoc(docRef, {
      content: data,
      updatedAt: Timestamp.now(),
      updatedBy: currentUser.uid,
    });
  } catch (error: any) {
    console.error(`Error updating CMS section ${section}:`, error);
    
    // Provide clear error messages
    if (error.code === "permission-denied" || error.message?.includes("permission")) {
      throw new Error(
        `Permission denied. Your Firestore security rules need to allow admin writes to the "cms_content" collection. ` +
        `Please update your rules in Firebase Console → Firestore → Rules. ` +
        `Add: match /cms_content/{document=**} { allow read: if true; allow write: if request.auth != null; }`
      );
    }
    throw error;
  }
};
