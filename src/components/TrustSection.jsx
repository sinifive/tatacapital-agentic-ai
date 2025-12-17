import React from 'react'
import { motion } from 'framer-motion'

export default function TrustSection() {
  const testimonials = [
    {
      name: 'Raj Kumar',
      role: 'Software Engineer',
      feedback: 'Got ₹5 lakhs approved in just 15 minutes. The entire process was so smooth. No hidden charges, everything transparent. Highly recommended!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Business Owner',
      description: 'Needed funds for business expansion. The team was so helpful in explaining everything. Got the money in my account within 24 hours.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Freelancer',
      feedback: 'As a freelancer, getting loan approval from traditional banks was impossible. Tata Capital understood my situation and approved my loan. Thanks!',
      rating: 5
    }
  ]

  const trustPoints = [
    'RBI Regulated Financial Institution',
    'ISO 9001:2015 Certified',
    'CERT-IN Compliant Data Security',
    'Zero Processing Fees',
    'Transparent Interest Rates',
    'Regulatory Compliant Agreements'
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Over 10 Lakh Indians
          </h2>
          <p className="text-xl text-gray-600">
            Real stories from real customers who achieved their dreams with us
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-lg p-8 border border-blue-200 shadow-md hover:shadow-lg transition"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>

              {/* Feedback */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.feedback}"
              </p>

              {/* Author */}
              <div className="border-t border-blue-200 pt-4">
                <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-12"
        >
          <h3 className="text-3xl font-bold mb-12 text-center">Why Trust Tata Capital?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {trustPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 text-blue-900 font-bold">
                  ✓
                </div>
                <span className="text-lg">{point}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
