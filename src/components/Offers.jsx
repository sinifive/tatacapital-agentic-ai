import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Zap, Target, Clock, Award, Star } from 'lucide-react'

export default function Offers({ onApply }) {
  const [selectedOffer, setSelectedOffer] = useState(null)

  const offers = [
    {
      id: 1,
      title: 'New Year Bonanza',
      icon: Gift,
      discount: '₹50,000 Cashback',
      description: 'Get up to ₹50,000 cashback on personal loans above ₹3 lakhs',
      terms: ['Valid till 31st January 2026', 'Minimum loan amount ₹3,00,000', 'Instant approval'],
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-100 to-rose-100',
      badge: 'Limited Time',
      validity: 'Ends in 50 days'
    },
    {
      id: 2,
      title: 'Refer & Earn',
      icon: Target,
      discount: 'Earn ₹10,000 per Referral',
      description: 'Refer a friend and earn ₹10,000 when they apply for a loan',
      terms: ['No limit on referrals', 'Get instant bonus', 'Plus 1% lower ROI for you'],
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-100 to-cyan-100',
      badge: 'Ongoing',
      validity: 'Always Active'
    },
    {
      id: 3,
      title: 'Credit Card Boost',
      icon: Star,
      discount: '0% Interest for 3 Months',
      description: 'Get 0% interest for first 3 months on personal loans above ₹2 lakhs',
      terms: ['Interest-free period', 'Minimum ₹2,00,000 loan', 'Auto-debit required'],
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-100 to-orange-100',
      badge: 'New',
      validity: 'Till 15th Feb 2026'
    },
    {
      id: 4,
      title: 'Business Growth Package',
      icon: Zap,
      discount: 'Free Business Counseling',
      description: 'Business loan + free 6-month mentorship from industry experts',
      terms: ['For loan above ₹10 lakhs', '1:1 mentorship sessions', 'Expert network access'],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-100 to-emerald-100',
      badge: 'Pro',
      validity: 'Dec 2025 - Mar 2026'
    },
    {
      id: 5,
      title: 'Festival Special',
      icon: Award,
      discount: 'Lowest ROI Guarantee',
      description: 'Get the lowest ROI in market or we\'ll match it + waive processing fee',
      terms: ['ROI match guarantee', 'Processing fee waived', 'Quick approval'],
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-100 to-indigo-100',
      badge: 'Exclusive',
      validity: 'Till 30th Dec 2025'
    },
    {
      id: 6,
      title: 'EMI Holiday Offer',
      icon: Clock,
      discount: '6 Months EMI Holiday',
      description: 'Skip EMI for 6 months after approval - perfect for business ramp-up',
      terms: ['Business loans only', '₹25,00,000 and above', 'Extended tenure'],
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'from-teal-100 to-cyan-100',
      badge: 'Hot',
      validity: 'Till 31st Jan 2026'
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
    <section className="relative bg-gradient-to-br from-slate-50 via-purple-50 to-white py-16">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
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
            🎉 Exclusive Offers & Deals
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Limited-time offers that put money back in your pocket and fuel your dreams
          </p>
        </motion.div>

        {/* Offers Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {offers.map((offer) => {
            const Icon = offer.icon
            return (
              <motion.div
                key={offer.id}
                className="relative group cursor-pointer"
                variants={cardVariants}
                onClick={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
              >
                {/* Card background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${offer.bgColor} rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300`} />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />

                {/* Badge */}
                <div className="absolute -top-4 right-6 bg-gradient-to-r from-tata-yellow to-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase">
                  {offer.badge}
                </div>

                {/* Card content */}
                <div className="relative p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${offer.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{offer.title}</h3>

                  {/* Main Offer */}
                  <p className={`text-2xl font-bold bg-gradient-to-r ${offer.color} bg-clip-text text-transparent mb-3`}>
                    {offer.discount}
                  </p>

                  {/* Description */}
                  <p className="text-slate-600 mb-4 flex-grow">{offer.description}</p>

                  {/* Terms (Expandable) */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: selectedOffer === offer.id ? 'auto' : 0,
                      opacity: selectedOffer === offer.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="pt-4 border-t border-slate-200 space-y-2">
                      {offer.terms.map((term, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-tata-blue font-bold mt-0.5">✓</span>
                          {term}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Validity badge */}
                  <div className="mb-4 text-xs text-slate-500 font-semibold">
                    ⏰ {offer.validity}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      onApply()
                    }}
                    className={`w-full bg-gradient-to-r ${offer.color} text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Claim Offer
                  </motion.button>

                  {/* Expand indicator */}
                  <div className="text-center text-xs text-slate-500 mt-2">
                    {selectedOffer === offer.id ? '▲ Hide details' : '▼ Show details'}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-tata-blue to-blue-600 rounded-2xl p-8 sm:p-12 text-white text-center shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">
            Don't Miss Out! 🚀
          </h3>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            These offers are exclusively for our valued customers. Apply now and get instant pre-approval.
          </p>
          <motion.button
            onClick={onApply}
            className="bg-tata-yellow text-slate-900 px-10 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply for Loan Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
