import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Rocket } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: "Submit Your Request",
    description: "Tell us about your project requirements or request topic suggestions tailored to your course."
  },
  {
    icon: Hammer,
    title: "We Build It For You",
    description: "Our expert team works on your project while you track progress in real-time."
  },
  {
    icon: Rocket,
    title: "Track & Receive",
    description: "Monitor progress and receive deliverables on time, Get your completed project with documentation and support for your presentation."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to academic success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-card rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 gradient-primary rounded-full flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-purple-300" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;