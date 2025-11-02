import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const caseStudies = [
	{
		id: 1,
		title: 'CNN Based Tomatoes Leaf Disease Detection for Smart Agriculture',
		student: 'Chidinma O., MSc Computer Engineering',
		school: 'Michel Okpara University of Agriculture, Umudike',
		description:
			'ML Based system using convolutional neural networks to identify and classify 10 different tomato leaf diseases in real-time for screening and treatment recommendations with real time LLM Chat integration',
		image: '/Tomato plants with healthy and diseased leaves in an agricultural setting.png',
		results: 'Achieved 92% accuracy in disease detection',
		link: "https://tomatodetection.vercel.app",
	},
	{
		id: 2,
		title: 'Text to speech system using Groq playaitts',
		student: 'Ochulor Chibuzor Daniel, BSc Computer Science',
		school: 'Micheal Okpara University of Agriculture, Umudike',
		description:
			'Text-to-speech application leveraging Groq PlayAITTS for high-quality, natural-sounding speech synthesis from text input',
		image: 'Healthcare AI system with medical data visualization and predictions',
		results: 'Up to 95% natural-sounding speech generation and 15 voices',
		link: 'https://text-to-speech-mini-app.vercel.app/',
	},
	{
		id: 3,
		title: 'E-Commerce Platform with Analytics',
		student: 'Tunde O., Final Year CS',
		school: 'University of Lagos',
		description:
			'Full-stack e-commerce solution with real-time analytics, payment integration, and inventory management',
		image: 'Modern e-commerce website with shopping cart and analytics dashboard',
		results: 'Won Best Project Award',
		link: 'https://example.com/ecommerce-platform',
	},
];

const CaseStudies = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const next = () =>
		setCurrentIndex((prev) => (prev + 1) % caseStudies.length);
	const prev = () =>
		setCurrentIndex((prev) => (prev - 1 + caseStudies.length) % caseStudies.length);

	return (
		<section className="py-20 px-4 bg-white">
			<div className="container mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mb-12"
				>
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Success Stories
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Real projects, real results from students like you
					</p>
				</motion.div>

				<div className="relative max-w-4xl mx-auto">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentIndex}
							initial={{ opacity: 0, x: 100 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 5 -100 }}
							transition={{ duration: 0.5 }}
							className="bg-gradient-card rounded-2xl overflow-hidden shadow-xl"
						>
							<div className="grid md:grid-cols-2 gap-8 p-8">
								<div className="space-y-4">
									<h3 className="text-3xl font-bold text-gray-900">
										{caseStudies[currentIndex].title}
									</h3>
									<p className="text-purple-600 font-semibold">
										{caseStudies[currentIndex].student}
									</p>
									<p className="text-gray-600">
										{caseStudies[currentIndex].school}
									</p>
									<p className="text-gray-700 leading-relaxed">
										{caseStudies[currentIndex].description}
									</p>
									<div className="pt-4 border-t border-purple-200">
										<p className="text-green-600 font-semibold">
											✨ {caseStudies[currentIndex].results}
										</p>
										<a
											href={caseStudies[currentIndex].link}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors text-sm font-medium"
										>
											View Project
										</a>
									</div>
								</div>
								<div className="rounded-xl overflow-hidden">
									<img
										alt={caseStudies[currentIndex].title}
										className="w-full h-full object-cover"
										src={caseStudies[currentIndex].image}
									/>
								</div>
							</div>
						</motion.div>
					</AnimatePresence>

					<div className="flex justify-center gap-4 mt-8">
						<Button
							variant="outline"
							size="icon"
							onClick={prev}
							className="rounded-full border-purple-300 hover:bg-purple-50"
							aria-label="Previous case study"
						>
							<ChevronLeft className="w-5 h-5" />
						</Button>
						<div className="flex items-center gap-2">
							{caseStudies.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentIndex(index)}
									className={`w-2 h-2 rounded-full transition-all ${
										index === currentIndex
											? 'bg-purple-600 w-8'
											: 'bg-purple-300'
									}`}
									aria-label={`Go to case study ${index + 1}`}
								/>
							))}
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={next}
							className="rounded-full border-purple-300 hover:bg-purple-50"
							aria-label="Next case study"
						>
							<ChevronRight className="w-5 h-5" />
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CaseStudies;