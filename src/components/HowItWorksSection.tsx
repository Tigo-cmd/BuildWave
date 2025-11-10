import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Hammer, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Tell Us What You Need",
    description:
      "Share your project requirements or request topic suggestions tailored to your course.",
  },
  {
    icon: Hammer,
    title: "We Build It",
    description:
      "Our expert team works on your project while you track progress in real-time.",
  },
  {
    icon: CheckCircle,
    title: "Receive & Excel",
    description:
      "Get your completed project with documentation and support for your presentation.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 px-4 bg-white" id="how-it-works">
      <div className="container mx-auto">
        {/* Header */}
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
            Get your project done in three simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                {/* Card */}
                <div className="bg-gradient-card rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300">
                  <div className="relative inline-block mb-6">
                    {/* Glow pulse effect */}
                    <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60 group-hover:opacity-90 animate-pulse"></div>

                    {/* Icon circle */}
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-10 w-10 text-white" />
                    </div>

                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-purple-300" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
