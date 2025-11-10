
import { Footer } from "@/components/Footer";
import { TrackProjectModal } from "@/components/TrackProjectModal";
import { ProjectRequestModal } from "@/components/ProjectRequestModal";
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

const topicSuggestions = [
  {
    id: 1,
    title: "AI-Powered Student Attendance System",
    level: "Undergraduate",
    discipline: "Computer Science",
    description: "Face recognition-based attendance tracking with real-time notifications."
  },
  {
    id: 2,
    title: "Smart Home Energy Management System",
    level: "Undergraduate",
    discipline: "Electrical Engineering",
    description: "IoT-based system for monitoring and optimizing household energy consumption."
  },
  {
    id: 3,
    title: "Fake News Detection using Deep Learning",
    level: "Masters",
    discipline: "Computer Science",
    description: "NLP and neural networks to identify misinformation in social media."
  },
  {
    id: 4,
    title: "Automated Plant Disease Detection",
    level: "Undergraduate",
    discipline: "Agricultural Engineering",
    description: "Computer vision system to identify and classify crop diseases."
  },
  {
    id: 5,
    title: "Blockchain-Based Medical Records System",
    level: "Masters",
    discipline: "Information Technology",
    description: "Secure, decentralized platform for storing and sharing patient data."
  },
  {
    id: 6,
    title: "Traffic Flow Prediction Using Machine Learning",
    level: "PhD",
    discipline: "Civil Engineering",
    description: "Advanced ML models for urban traffic pattern analysis and prediction."
  },
];

const Topics = () => {
  const navigate = useNavigate();
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const filteredTopics = topicSuggestions.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "All" || topic.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleRequestTopic = (topic: typeof topicSuggestions[0]) => {
    setSelectedTopic(topic.title);
    setProjectModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Project Topics Library - BuildWave</title>
        <meta name="description" content="Browse curated project topic ideas for undergraduate, masters, and PhD students across all engineering and science disciplines" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container px-4 py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Project Topics Library
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore curated project ideas tailored to your academic level
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Undergraduate", "Masters", "PhD"].map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  onClick={() => setSelectedLevel(level)}
                  className={selectedLevel === level ? "btn-hero" : ""}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="default" className="bg-primary">
                      {topic.level}
                    </Badge>
                    <Badge variant="outline">{topic.discipline}</Badge>
                  </div>
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full btn-accent"
                    onClick={() => handleRequestTopic(topic)}
                    aria-label={`Request project on ${topic.title}`}
                  >
                    Request This Topic
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No topics found matching your criteria</p>
            </div>
          )}
        </main>

        <Footer onTrackProject={() => setTrackModalOpen(true)} />
        <TrackProjectModal open={trackModalOpen} onOpenChange={setTrackModalOpen} />
        <ProjectRequestModal 
          open={projectModalOpen} 
          onOpenChange={setProjectModalOpen}
          prefilledService={selectedTopic}
        />
      </div>
    </>
  );
};

export default Topics;
