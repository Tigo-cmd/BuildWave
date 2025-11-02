import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain, Cpu, FileText, Code, Database, Microscope, Spade, Building, Building2, RulerIcon, CircuitBoard, User } from 'lucide-react';

const services = [
  {
    id: 1,
    icon: Brain,
    title: "AI & Machine Learning",
    description: "Custom ML models, neural networks, and intelligent systems",
    level: "All Levels",
    turnaround: "4-8 weeks",
    fromPrice: "₦150,000 - ₦300,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "Computer Science"
  },
  {
    id: 2,
    icon: Cpu,
    title: "IoT & Embedded Systems",
    description: "Smart devices, Arduino, ESP32, Raspberry Pi, and sensor networks",
    level: "All Levels",
    turnaround: "3-6 weeks",
    fromPrice: "₦70,000 - ₦250,000",
    tags: ["Undergraduate", "Masters","PhD" ],
    discipline: "Electrical Engineering"
  },
  {
    id: 3,
    icon: FileText,
    title: "Research & Thesis Writing",
    description: "Literature review, methodology, data analysis, and full thesis",
    level: "All Levels",
    turnaround: "6-12 weeks",
    fromPrice: "₦100,000, ₦200,000",
    tags: ["Undergraduate", "Masters","PhD" ],
    discipline: "All Disciplines"
  },
  {
    id: 4,
    icon: Code,
    title: "Web & Mobile Development",
    description: "Full-stack applications, mobile apps, and responsive websites",
    level: "All Levels",
    turnaround: "4-12 weeks",
    fromPrice: "₦150,000 - ₦350,000",
    tags: ["Undergraduate", "Masters", "PhD", "StartUps"],
    discipline: "Software Engineering"
  },
  {
    id: 5,
    icon: Database,
    title: "Data Science & Analytics",
    description: "Data mining, visualization, predictive modeling, and insights",
    level: "All Levels",
    turnaround: "3-6 weeks",
    fromPrice: "₦100,000 - ₦250,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "Data Science"
  },
  {
    id: 6,
    icon: Microscope,
    title: "Research Methodology",
    description: "Experimental design, statistical analysis, and research frameworks",
    level: "PhD",
    turnaround: "4-12 weeks",
    fromPrice: "₦100,000 - ₦200,000",
    tags: ["PhD"],
    discipline: "All Disciplines"
  },
  {
    id: 7,
    icon: Building2,
    title: "CAD & 3D Modeling",
    description: "Product design, simulations, and 3D printing models",
    level: "All Levels",
    turnaround: "1-2 weeks",
    fromPrice: "₦100,000 - ₦350,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "All Disciplines"
  },
  {
    id: 8,
    icon: CircuitBoard,
    title: "Electrical Circuit Design",
    description: "PCB design, circuit simulations, and embedded systems",
    level: "All Levels",
    turnaround: "2-6 weeks",
    fromPrice: "₦100,000 - ₦300,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "All Disciplines"
  },
  {
    id: 9,
    icon: User,
    title: "Consultancy Services",
    description: "Project planning, technical guidance, and expert advice",
    level: "All Levels",
    turnaround: "2-4 weeks",
    fromPrice: "Personalized Pricing",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "All Disciplines"
  }
];

const filters = ["All", "Undergraduate", "Masters", "PhD"];

const ServicesSection = ({ onServiceRequest }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services.filter(service => {
    const matchesFilter = activeFilter === "All" || service.tags.includes(activeFilter);
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="services" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert support across all academic levels and disciplines
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-center">
          <div className="flex gap-2 flex-wrap justify-center">
            {filters.map(filter => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                onClick={() => setActiveFilter(filter)}
                className={activeFilter === filter ? "gradient-primary text-white" : ""}
              >
                {filter}
              </Button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
            aria-label="Search services"
          />
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center mb-4">
                <service.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {service.level}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {service.turnaround}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {service.fromPrice}
                </span>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => onServiceRequest(service)}
                  className="flex-1 gradient-primary text-white"
                >
                  Request this
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onServiceRequest(service)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  See example
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;