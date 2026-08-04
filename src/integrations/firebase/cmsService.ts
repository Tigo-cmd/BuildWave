import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./config";

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
    badgeText: "🚀 Over 500+ Nigerian Students Graduated with Distinction",
    titlePrefix: "Your Final Year Project,",
    titleGradient: "Built to Perfection",
    titleSuffix: "No Stress.",
    description:
      "We design, build, write, and guide you through your Final Year Project, Dissertation, or Research Thesis. From topic approval to final defense preparation.",
    ctaPrimaryText: "Start Your Project",
    ctaSecondaryText: "Explore Topics",
    stat1Value: "500+",
    stat1Label: "Projects Completed",
    stat2Value: "98.4%",
    stat2Label: "Success Rate",
    stat3Value: "4.9/5",
    stat3Label: "Student Rating",
  },
  services: [
    {
      id: "web-mobile",
      title: "Web & Mobile App Development",
      description: "Full-stack software systems built with modern frameworks (React, Node.js, Python, Flutter) with clean source code and system documentation.",
      badge: "Software Engineering",
      deliverables: ["Complete Source Code", "Database Schema & ERD", "System Architecture Specs", "Live Demo & Deployment"],
    },
    {
      id: "ai-data",
      title: "AI, Machine Learning & Data Science",
      description: "Advanced machine learning models, computer vision pipelines, NLP applications, and predictive analytics dashboards with Jupyter notebooks.",
      badge: "Artificial Intelligence",
      deliverables: ["Trained ML Models", "Dataset Preprocessing Pipelines", "Performance Metrics (Accuracy/F1)", "Jupyter Notebook & Report"],
    },
    {
      id: "documentation",
      title: "Chapter 1-5 Thesis & Dissertation Writing",
      description: "Comprehensive, plagiarism-free academic research writing formatted according to your university's guidelines and APA standard.",
      badge: "Academic Writing",
      deliverables: ["Chapters 1 through 5", "Turnitin Plagiarism Report", "Proper Referencing (APA/IEEE)", "Full Literature Review"],
    },
    {
      id: "defense-prep",
      title: "Defense Coaching & Slide Design",
      description: "1-on-1 mock defense preparation, question anticipation guide, and presentation pitch deck design to ensure you ace your defense.",
      badge: "Mentorship",
      deliverables: ["Professional PowerPoint Deck", "Expected Questions & Answers", "1-on-1 Practice Defense", "Code Walkthrough Session"],
    },
  ],
  caseStudies: [
    {
      id: "cs-1",
      title: "AI-Powered Crop Disease Detection System",
      student: "Chidi O.",
      institution: "UNILAG",
      discipline: "Computer Engineering",
      grade: "A (First Class)",
      quote: "BuildWave delivered a working Mobile App with CNN model and full Chapter 1-5 write-up in 3 weeks. Defense was a breeze!",
      tags: ["Deep Learning", "React Native", "Python"],
    },
    {
      id: "cs-2",
      title: "Smart Telemedicine Portal with Automated Vitals Tracking",
      student: "Amina B.",
      institution: "Ahmadu Bello University",
      discipline: "Software Engineering",
      grade: "A (Distinction)",
      quote: "The source code structure was so clean that my external examiner praised the architecture during my presentation.",
      tags: ["Node.js", "Firebase", "WebSockets"],
    },
    {
      id: "cs-3",
      title: "Fintech Fraud Detection using Ensemble Learning",
      student: "Emeka K.",
      institution: "FUTO",
      discipline: "Data Science",
      grade: "A",
      quote: "They provided step-by-step guidance on how the XGBoost model worked. I answered every supervisor question with total confidence.",
      tags: ["Scikit-Learn", "FastAPI", "Dashboard"],
    },
  ],
  howItWorks: [
    {
      step: "01",
      title: "Submit Requirements",
      description: "Share your approved topic, departmental guidelines, or let us help you formulate a unique project topic.",
    },
    {
      step: "02",
      title: "Milestone-Based Execution",
      description: "Work with designated engineers and research leads. Receive progress videos, source code, and chapter drafts.",
    },
    {
      step: "03",
      title: "Review & Defense Prep",
      description: "Test your system live, review the documentation, and participate in mock defense coaching before submission.",
    },
  ],
  reviewsHeading: {
    badge: "Student Wall of Love",
    title: "Loved by Students Across 30+ Universities",
    subtitle: "Real stories from final year students who scaled through their defense with top grades.",
  },
};

/**
 * Fetch dynamic CMS section or return fallback default data
 */
export const getCMSSection = async <K extends keyof CMSData>(section: K): Promise<CMSData[K]> => {
  try {
    const docRef = doc(db, "cms_content", section);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().content as CMSData[K];
    }
  } catch (error) {
    console.error(`Error fetching CMS section ${section}:`, error);
  }
  return defaultCMSData[section];
};

/**
 * Save CMS section data to Firestore
 */
export const updateCMSSection = async <K extends keyof CMSData>(section: K, data: CMSData[K]): Promise<void> => {
  try {
    const docRef = doc(db, "cms_content", section);
    await setDoc(docRef, {
      content: data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating CMS section ${section}:`, error);
    throw error;
  }
};
