import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';

const topics = [
  { id: 1, title: "AI-Powered Student Performance Prediction System", level: "Undergraduate", discipline: "Computer Science" },
  { id: 2, title: "IoT-Based Smart Agriculture Monitoring", level: "Undergraduate", discipline: "Electrical Engineering" },
  { id: 3, title: "Blockchain for Supply Chain Transparency", level: "Masters", discipline: "Information Technology" },
  { id: 4, title: "Machine Learning for Medical Diagnosis", level: "Masters", discipline: "Computer Science" },
  { id: 5, title: "Autonomous Drone Navigation System", level: "PhD", discipline: "Robotics" },
  { id: 6, title: "Natural Language Processing for Local Languages", level: "PhD", discipline: "Computational Linguistics" },
  { id: 7, title: "Smart Traffic Management Using Computer Vision", level: "Undergraduate", discipline: "Computer Engineering" },
  { id: 8, title: "Renewable Energy Optimization System", level: "Masters", discipline: "Electrical Engineering" },
  { id: 9, title: "E-Learning Platform with Adaptive Learning", level: "Undergraduate", discipline: "Software Engineering" },
  { id: 10, title: "Cybersecurity Threat Detection Using AI", level: "Masters", discipline: "Cybersecurity" }
];

const TopicsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.discipline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || topic.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <>
      <Helmet>
        <title>Project Topics Library - BuildWave</title>
        <meta name="description" content="Browse hundreds of project topic suggestions for undergraduate, masters, and PhD students across all disciplines." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
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

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics or disciplines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Undergraduate', 'Masters', 'PhD'].map(level => (
                <Button
                  key={level}
                  variant={levelFilter === level ? 'default' : 'outline'}
                  onClick={() => setLevelFilter(level)}
                  className={levelFilter === level ? 'gradient-primary text-white' : ''}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {filteredTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {topic.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {topic.level}
                      </span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {topic.discipline}
                      </span>
                    </div>
                  </div>
                  <Button className="gradient-primary text-white">
                    Request This Topic
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopicsPage;