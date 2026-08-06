import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCMSSection, CaseStudyItem, defaultCMSData } from '@/integrations/firebase/cmsService';

export const CaseStudiesSection = () => {
	const [caseStudiesList, setCaseStudiesList] = useState<any[]>(defaultCMSData.caseStudies);
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		getCMSSection("caseStudies").then((data) => {
			if (data && data.length > 0) {
				setCaseStudiesList(data);
			}
		}).catch((err) => console.warn("Failed to fetch CMS case studies:", err));
	}, []);

	const next = () =>
		setCurrentIndex((prev) => (prev + 1) % caseStudiesList.length);
	const prev = () =>
		setCurrentIndex((prev) => (prev - 1 + caseStudiesList.length) % caseStudiesList.length);

	const currentItem = caseStudiesList[currentIndex] || defaultCMSData.caseStudies[0];

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
										{currentItem.title}
									</h3>
									<p className="text-purple-600 font-semibold">
										{currentItem.student}
									</p>
									<p className="text-gray-600">
										{currentItem.institution || currentItem.school || currentItem.discipline}
									</p>
									<p className="text-gray-700 leading-relaxed">
										{currentItem.quote || currentItem.description}
									</p>
									<div className="pt-4 border-t border-purple-200">
										<p className="text-green-600 font-semibold">
											✨ {currentItem.grade || currentItem.results}
										</p>
										{(currentItem.projectUrl || currentItem.link) && (
											<a
												href={currentItem.projectUrl || currentItem.link}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors text-sm font-medium"
											>
												View Project <ExternalLink className="w-3.5 h-3.5" />
											</a>
										)}
									</div>
								</div>
								<div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-[220px]">
									{currentItem.image ? (
										<img
											alt={currentItem.title}
											className="w-full h-full object-cover max-h-[320px]"
											src={currentItem.image}
											onError={(e) => {
												(e.target as HTMLElement).style.display = 'none';
											}}
										/>
									) : (
										<div className="p-8 text-center text-muted-foreground">
											<p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{currentItem.title}</p>
											<p className="text-xs">{currentItem.discipline || "Academic Success Project"}</p>
										</div>
									)}
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
							{caseStudiesList.map((_, index) => (
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

// export default CaseStudies;