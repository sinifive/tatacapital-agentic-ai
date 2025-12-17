import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, BarChart3, Zap, Package, Users, TrendingUp } from 'lucide-react'

export default function LoansForBusiness({ onApply }) {
  const businessLoans = [
    {
      id: 1,
      title: 'Startup Funding',
      icon: Zap,
      amount: '₹5,00,000 - ₹5 Cr',
      roi: '9.99% - 12.99%',
      tenure: '24 - 84 months',
      features: ['No collateral', 'Growth support', 'Mentorship access'],
      color: 'from-red-500 to-red-600',
      badge: 'New Business'
    },
    {
      id: 2,
      title: 'Working Capital',
      icon: BarChart3,
      amount: '₹10,00,000 - ₹10 Cr',
      roi: '8.99% - 11.99%',
      tenure: '12 - 60 months',
      features: ['Quick disbursement', 'Inventory financing', 'Flexible repayment'],
      color: 'from-cyan-500 to-cyan-600',
      badge: 'Most Used'
    },
    {
      id: 3,
      title: 'Equipment Loan',
      icon: Package,
      amount: '₹5,00,000 - ₹25 Cr',
      roi: '7.99% - 10.49%',
      tenure: '36 - 120 months',
      features: ['Equipment purchase', 'Low EMI', 'Tax deductible'],
      color: 'from-amber-500 to-amber-600',
      badge: null
    },
    {
      id: 4,
      title: 'Expansion Loan',
      icon: TrendingUp,
      amount: '₹25,00,000 - ₹50 Cr',
      roi: '8.49% - 10.99%',
      tenure: '60 - 120 months',
      features: ['Open new branch', 'Scale operations', 'Strategic growth'],
      color: 'from-green-500 to-green-600',
      badge: 'Growth Ready'
    },
    {
      id: 5,
      title: 'Trade Finance',
      icon: Users,
      amount: '₹10,00,000 - ₹20 Cr',
      roi: '6.99% - 9.49%',
      tenure: '6 - 180 days + renewal',
      features: ['Import/Export', 'Supply chain', 'Fast processing'],
      color: 'from-violet-500 to-violet-600',
      badge: null
    },
    {
      id: 6,
      title: 'Franchise Loan',
      icon: Briefcase,
      amount: '₹10,00,000 - ₹5 Cr',
      roi: '9.49% - 11.99%',
      tenure: '48 - 84 months',
      features: ['Franchise-ready', 'Proven business model', 'Brand support'],
      color: 'from-orange-500 to-orange-600',
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
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 -right-40 w-96 h-96 bg-gradient-to-br from-tata-blue/20 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 -left-40 w-80 h-80 bg-gradient-to-tr from-tata-yellow/10 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
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
          <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-4">
            Fuel Your Business Growth
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive financing solutions designed for entrepreneurs and established businesses
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
          {businessLoans.map((loan) => {
            const Icon = loan.icon
            return (
              <motion.div
                key={loan.id}
                className="relative group"
                variants={cardVariants}
              >
                {/* Card background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300 border border-slate-700" />

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
                  <h3 className="text-2xl font-bold text-white mb-2">{loan.title}</h3>

                  {/* Amount */}
                  <p className="text-lg font-semibold text-yellow-400 mb-4">{loan.amount}</p>

                  {/* Details */}
                  <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">📊 ROI:</span>
                      <span className="font-semibold text-gray-200">{loan.roi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">⏱️ Tenure:</span>
                      <span className="font-semibold text-gray-200">{loan.tenure}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {loan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-tata-yellow font-bold mt-0.5">✓</span>
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
          <p className="text-lg text-gray-300 mb-6">
            Ready to take your business to the next level?
          </p>
          <motion.button
            onClick={onApply}
            className="bg-gradient-to-r from-tata-yellow to-yellow-400 text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Business Loan Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
