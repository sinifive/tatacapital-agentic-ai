import React from 'react'
import { motion } from 'framer-motion'

export default function BenefitsSection() {
  const benefits = [
    {
      title: 'Lightning Fast Approval',
      description: 'Get instant pre-approval checks and know your eligibility in minutes. No endless paperwork, no waiting periods. Most applications approved within 24 hours.'
    },
    {
      title: 'Lowest Interest Rates',
      description: 'Competitive interest rates starting from 7.99% p.a. We believe in transparency - no hidden charges, no processing fees surprises.'
    },
    {
      title: 'Flexible Loan Amounts',
      description: 'Borrow what you need - from ₹50,000 to ₹50 lakhs. Whether it\'s a small personal expense or a big dream, we have a plan for you.'
    },
    {
      title: 'Easy Eligibility',
      description: 'Simple eligibility criteria with minimal documentation. Salaried professionals, self-employed, business owners - everyone qualifies.'
    },
    {
      title: 'Digital First Process',
      description: 'Complete your entire loan journey online. No branch visits needed. Apply from home, get approved online, receive funds in your account.'
    },
    {
      title: 'AI-Powered Verification',
      description: 'Advanced KYC using document verification, liveness detection, and deepfake prevention. Your security is our priority.'
    }
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Tata Capital?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            India's most trusted financial partner with over 25 years of experience in personal finance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-yellow-50 to-blue-50 rounded-lg p-8 border border-yellow-200 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-lg">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-700 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-4xl font-bold mb-2">25+</h4>
              <p className="text-blue-100">Years of Excellence</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">10L+</h4>
              <p className="text-blue-100">Happy Customers</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">₹5000 Cr+</h4>
              <p className="text-blue-100">Loans Disbursed</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">99%</h4>
              <p className="text-blue-100">Customer Satisfaction</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
