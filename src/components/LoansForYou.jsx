import React from 'react'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Heart, Home, Car, GraduationCap, Briefcase } from 'lucide-react'

export default function LoansForYou({ onApply }) {
  const personalLoans = [
    {
      id: 1,
      title: 'Quick Personal Loan',
      icon: Zap,
      amount: '₹1,00,000 - ₹25,00,000',
      roi: '7.99% - 10.99%',
      tenure: '12 - 84 months',
      features: ['Instant approval', 'No collateral needed', 'Quick disbursal'],
      color: 'from-blue-500 to-blue-600',
      badge: 'Popular'
    },
    {
      id: 2,
      title: 'Dream Home Loan',
      icon: Home,
      amount: '₹5,00,000 - ₹1 Cr',
      roi: '6.99% - 8.99%',
      tenure: '12 - 240 months',
      features: ['Low interest rates', 'Flexible tenure', 'Tax benefits'],
      color: 'from-green-500 to-green-600',
      badge: 'Best Rate'
    },
    {
      id: 3,
      title: 'Auto Loan',
      icon: Car,
      amount: '₹2,00,000 - ₹50,00,000',
      roi: '8.49% - 9.99%',
      tenure: '12 - 72 months',
      features: ['Car or bike', 'Quick approval', 'On-the-spot disbursal'],
      color: 'from-orange-500 to-orange-600',
      badge: null
    },
    {
      id: 4,
      title: 'Education Loan',
      icon: GraduationCap,
      amount: '₹5,00,000 - ₹20,00,000',
      roi: '7.99% - 9.49%',
      tenure: '5 - 15 years',
      features: ['Study abroad support', 'Moratorium period', 'Parent as co-applicant'],
      color: 'from-purple-500 to-purple-600',
      badge: null
    },
    {
      id: 5,
      title: 'Wedding Loan',
      icon: Heart,
      amount: '₹1,00,000 - ₹50,00,000',
      roi: '9.49% - 11.99%',
      tenure: '12 - 60 months',
      features: ['Special offers', 'Flexible EMI', 'Fast processing'],
      color: 'from-pink-500 to-pink-600',
      badge: 'Festival Offer'
    },
    {
      id: 6,
      title: 'Investment Loan',
      icon: TrendingUp,
      amount: '₹2,50,000 - ₹1 Cr',
      roi: '8.99% - 10.49%',
      tenure: '24 - 120 months',
      features: ['Invest in stocks', 'Mutual funds', 'Business expansion'],
      color: 'from-indigo-500 to-indigo-600',
      badge: null
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-white py-16">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-4">
            Loans Tailored Just For You
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose from a variety of personal loans designed to meet your unique financial needs
          </p>
        </motion.div>

        {/* Loan Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {personalLoans.map((loan) => {
            const Icon = loan.icon
            return (
              <motion.div
                key={loan.id}
                className="relative group"
                variants={cardVariants}
              >
                {/* Card background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300" />

                {/* Badge */}
                {loan.badge && (
                  <div className="absolute -top-4 right-6 bg-gradient-to-r from-tata-yellow to-yellow-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    {loan.badge}
                  </div>
                )}

                {/* Card content */}
                <div className="relative p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${loan.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{loan.title}</h3>

                  {/* Amount */}
                  <p className="text-lg font-semibold text-slate-700 mb-4">{loan.amount}</p>

                  {/* Details */}
                  <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">📊 ROI:</span>
                      <span className="font-semibold text-tata-blue">{loan.roi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">⏱️ Tenure:</span>
                      <span className="font-semibold text-tata-blue">{loan.tenure}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {loan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.button
                    onClick={onApply}
                    className={`w-full bg-gradient-to-r ${loan.color} text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply Now
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-slate-600 mb-6">
            Not sure which loan is right for you?
          </p>
          <motion.button
            onClick={onApply}
            className="bg-gradient-to-r from-tata-blue to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Personalized Recommendations
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
