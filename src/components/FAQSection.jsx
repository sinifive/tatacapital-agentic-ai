import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'What is the minimum and maximum loan amount I can apply for?',
      answer: 'You can apply for loans ranging from ₹50,000 to ₹50 lakhs. The exact amount depends on your income, credit score, and repayment capacity. Our instant credit check will show your pre-approved limit.'
    },
    {
      question: 'What documents do I need to apply?',
      answer: 'You need just three documents: (1) Aadhaar Card for identification, (2) PAN Card for tax verification, and (3) Latest salary slip (for last 2 months). That\'s it! No need for bank statements, property documents, or cumbersome paperwork.'
    },
    {
      question: 'How long does approval take?',
      answer: 'Most applications are approved within 24 hours. You get instant pre-approval after completing the application, and the final sanction letter comes within 24 hours. Money is disbursed to your account immediately after approval.'
    },
    {
      question: 'What is the interest rate?',
      answer: 'Our interest rates start from 7.99% per annum, depending on your credit score and risk profile. There are no hidden charges. The interest rate offered is transparent and communicated before you accept the loan offer.'
    },
    {
      question: 'Is there a processing fee?',
      answer: 'No! Tata Capital charges zero processing fees. You don\'t pay anything to apply or get approved. The only cost is the EMI (Equated Monthly Installment) which includes interest and principal repayment.'
    },
    {
      question: 'What happens if my credit score is low?',
      answer: 'Even if your credit score is low, you can still apply. We have special schemes for people with low credit scores. Our AI-powered system looks at multiple factors beyond credit score, including income stability and employment history.'
    },
    {
      question: 'Can self-employed people apply?',
      answer: 'Yes! Self-employed professionals and business owners are welcome to apply. Instead of salary slips, you can provide ITR (Income Tax Returns) and business bank statements to prove your income. We recognize and value self-employment.'
    },
    {
      question: 'How long is the loan tenure?',
      answer: 'You can choose a tenure between 12 to 60 months based on your convenience and repayment capacity. Longer tenure means lower EMI but higher total interest, and vice versa. You can decide what works best for your budget.'
    }
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Have doubts? We've got answers. Check out the most common questions below.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <h3 className="text-left font-bold text-gray-900 text-lg">{faq.question}</h3>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl text-blue-600 flex-shrink-0 ml-4"
                >
                  ▼
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-gray-200 bg-gray-50"
                  >
                    <p className="px-6 py-4 text-gray-700 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">Still have questions? Our support team is here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
              Call Us: 1800-200-5555
            </button>
            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition">
              Chat with Us
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
