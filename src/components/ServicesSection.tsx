import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Cpu,
  FileText,
  Code,
  Database,
  Microscope,
  Building2,
  CircuitBoard,
  User,
} from "lucide-react";

// --- SERVICE DATA ---
const services = [
  {
    id: "ai-ml",
    icon: Brain,
    title: "AI & Machine Learning",
    description: "Custom ML models, neural networks, and intelligent systems.",
    level: "All Levels",
    turnaround: "4–8 weeks",
    fromPrice: "₦150,000 - ₦300,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "Computer Science",
  },
  {
    id: "iot-embedded",
    icon: Cpu,
    title: "IoT & Embedded Systems",
    description: "Smart devices, Arduino, ESP32, Raspberry Pi, and sensor networks.",
    level: "All Levels",
    turnaround: "3–6 weeks",
    fromPrice: "₦70,000 - ₦250,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "Electrical Engineering",
  },
  {
    id: "research-thesis",
    icon: FileText,
    title: "Research & Thesis Writing",
    description: "Literature review, methodology, data analysis, and full thesis.",
    level: "All Levels",
    turnaround: "6–12 weeks",
    fromPrice: "₦100,000 - ₦200,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "All Disciplines",
  },
  {
    id: "web-mobile",
    icon: Code,
    title: "Web & Mobile Development",
    description: "Full-stack applications, mobile apps, and responsive websites.",
    level: "All Levels",
    turnaround: "4–12 weeks",
    fromPrice: "₦150,000 - ₦350,000",
    tags: ["Undergraduate", "Masters", "PhD", "StartUps"],
    discipline: "Software Engineering",
  },
  {
    id: "data-science",
    icon: Database,
    title: "Data Science & Analytics",
    description: "Data mining, visualization, predictive modeling, and insights.",
    level: "All Levels",
    turnaround: "3–6 weeks",
    fromPrice: "₦100,000 - ₦250,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "Data Science",
  },
  {
    id: "research-methodology",
    icon: Microscope,
    title: "Research Methodology",
    description: "Experimental design, statistical analysis, and research frameworks.",
    level: "PhD",
    turnaround: "4–12 weeks",
    fromPrice: "₦100,000 - ₦200,000",
    tags: ["PhD"],
    discipline: "All Disciplines",
  },
  {
    id: "cad-modeling",
    icon: Building2,
    title: "CAD & 3D Modeling",
    description: "Product design, simulations, and 3D printing models.",
    level: "All Levels",
    turnaround: "1–2 weeks",
    fromPrice: "₦100,000 - ₦350,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "Engineering Design",
  },
  {
    id: "circuit-design",
    icon: CircuitBoard,
    title: "Electrical Circuit Design",
    description: "PCB design, circuit simulations, and embedded systems.",
    level: "All Levels",
    turnaround: "2–6 weeks",
    fromPrice: "₦100,000 - ₦300,000",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "Electrical Engineering",
  },
  {
    id: "consultancy",
    icon: User,
    title: "Consultancy Services",
    description: "Project planning, technical guidance, and expert advice.",
    level: "All Levels",
    turnaround: "2–4 weeks",
    fromPrice: "Personalized Pricing",
    tags: ["Undergraduate", "Masters", "PhD"],
    discipline: "All Disciplines",
  },
];

const filters = ["All", "Undergraduate", "Masters", "PhD"];

export const ServicesSection = ({ onRequestService }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtering logic
  const filteredServices = services.filter((service) => {
    const matchesFilter =
      activeFilter === "All" || service.tags.includes(activeFilter);
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section
      id="services"
      className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-50"
    >
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert academic and research support across all levels and disciplines
          </p>
        </motion.div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-center">
          <div className="flex gap-2 flex-wrap justify-center">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                onClick={() => setActiveFilter(filter)}
                className={
                  activeFilter === filter
                    ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg"
                    : "border-purple-200 text-purple-700 hover:bg-purple-50"
                }
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
          {filteredServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100">
                  <CardHeader>
                    <div className="relative inline-block mb-4">
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-xl blur-md bg-gradient-to-r from-purple-500 to-indigo-500 opacity-5 animate-pulse"></div>

                      {/* Icon */}
                      <div className="relative w-14 h-14 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 flex items-center justify-center shadow-md">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {service.title}
                    </CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{service.level}</Badge>
                      <Badge variant="outline">{service.turnaround}</Badge>
                      <Badge className="bg-green-100 text-green-700">
                        {service.fromPrice}
                      </Badge>
                    </div>
                  </CardContent>

                  <CardFooter className="gap-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:scale-105 transition-transform duration-200"
                      onClick={() => onRequestService(service.id)}
                    >
                      Request this
                    </Button>
                    <Button 
                      onClick={() => onRequestService(service.id)}
                      variant="outline" className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50">
                      See example
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
