import React from 'react'
import { motion } from 'framer-motion'

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: 'Apply Online',
      description: 'Fill out a simple form with basic details. Takes less than 5 minutes. No paperwork, no complexity.'
    },
    {
      step: 2,
      title: 'Upload Documents',
      description: 'Upload Aadhaar, PAN, and one salary slip. Our AI-powered system instantly verifies documents with deepfake detection.'
    },
    {
      step: 3,
      title: 'Instant Credit Check',
      description: 'Get an instant credit score assessment based on your financial profile. Know your approved limit in seconds.'
    },
    {
      step: 4,
      title: 'Get Sanctioned',
      description: 'Receive a digital sanction letter with all terms and conditions. Digitally signed and ready to download.'
    },
    {
      step: 5,
      title: 'Get Your Funds',
      description: 'Money transferred directly to your bank account within 24 hours. Start using it immediately.'
    }
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works in 5 Simple Steps
          </h2>
          <p className="text-xl text-gray-600">
            From application to approval to disbursement in less than 24 hours
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-yellow-400 to-blue-600" />

          <div className="grid md:grid-cols-5 gap-4 relative">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Circle with Step Number */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-lg relative z-10">
                    {item.step}
                  </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition h-full">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 text-center">{item.title}</h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to get started? Apply now and complete the entire process from your phone.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg hover:shadow-lg transition">
            Start Your Application
          </button>
        </motion.div>
      </div>
    </section>
  )
}
