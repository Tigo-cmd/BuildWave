import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: "Amaka Okoye",
    school: "University of Lagos",
    course: "Computer Engineering (Final Year)",
    photo: "Professional headshot of a smiling female Nigerian student",
    rating: 5,
    review: "BuildWave handled my final year project from proposal to deployment. The team was professional, responsive, and delivered beyond expectations. I graduated with distinction!"
  },
  {
    id: 2,
    name: "Ibrahim Musa",
    school: "Ahmadu Bello University",
    course: "MSc Data Science",
    photo: "Professional headshot of a confident male Nigerian graduate student",
    rating: 5,
    review: "My thesis research was complex, but BuildWave's experts made it manageable. They helped with methodology, analysis, and even got my work published. Highly recommended!"
  },
  {
    id: 3,
    name: "Chioma Nwosu",
    school: "Covenant University",
    course: "Electrical Engineering (Final Year)",
    photo: "Professional headshot of an enthusiastic female engineering student",
    rating: 5,
    review: "I needed an IoT project and had no idea where to start. BuildWave not only built it but taught me how it works. Amazing experience and great results!"
  },
  {
    id: 4,
    name: "Yusuf Adebayo",
    school: "University of Ibadan",
    course: "PhD Computer Science",
    photo: "Professional headshot of a scholarly male PhD candidate",
    rating: 5,
    review: "The research support I received was exceptional. BuildWave helped me refine my methodology and complete my dissertation ahead of schedule. Worth every naira!"
  },
  {
    id: 5,
    name: "Grace Eze",
    school: "Federal University of Technology, Minna",
    course: "Software Engineering (Final Year)",
    photo: "Professional headshot of a bright female software engineering student",
    rating: 5,
    review: "BuildWave delivered my web application project with clean code and excellent documentation. My supervisor was impressed, and I got an A!"
  }
];

const TestimonialsSection = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="testimonials" className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50" role="region" aria-label="Student testimonials">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of successful students who trusted BuildWave
          </p>
        </motion.div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                    <img alt={`${testimonial.name} profile photo`} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1542981532-0eb1c784c9a9" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.school}</p>
                    <p className="text-sm text-purple-600">{testimonial.course}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {testimonial.review}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full border-purple-300 hover:bg-purple-50"
              aria-label="Scroll testimonials left"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full border-purple-300 hover:bg-purple-50"
              aria-label="Scroll testimonials right"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;