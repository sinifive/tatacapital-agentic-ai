import React from 'react'
import { motion } from 'framer-motion'

export default function Hero({
  headline = 'Fast personal loans with friendly terms',
  subheadline = 'Apply in minutes. Instant pre-approval checks. Get a sanction letter without the wait.',
  onApply,
  onExplore,
}) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay: 0.3,
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-blue-50 to-white py-12 md:py-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-tata-yellow/20 to-tata-blue/10 rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-tata-blue/10 to-tata-yellow/10 rounded-full blur-3xl"
          animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            className="space-y-6 md:space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Headline */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                {headline}
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl"
              variants={itemVariants}
            >
              {subheadline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              variants={itemVariants}
            >
              {/* Primary CTA: Apply Now */}
              <motion.button
                onClick={onApply}
                className="relative group bg-tata-blue text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2"
                whileHover={{
                  backgroundColor: '#0a4fa0',
                  boxShadow: '0 20px 40px rgba(11, 99, 184, 0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative flex items-center justify-center gap-2">
                  Apply Now
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>

              {/* Secondary CTA: Explore Products */}
              <motion.button
                onClick={onExplore}
                className="relative bg-white border-2 border-tata-blue text-tata-blue px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-tata-blue focus:ring-offset-2 transition-colors"
                whileHover={{
                  backgroundColor: '#f0f7ff',
                  borderColor: '#0a4fa0',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Products
              </motion.button>
            </motion.div>

            {/* Stats/Trust indicators */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200"
              variants={itemVariants}
            >
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-tata-blue">7.99%</div>
                <p className="text-xs sm:text-sm text-slate-600">ROI starting from</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-tata-blue">10 mins</div>
                <p className="text-xs sm:text-sm text-slate-600">Spot Approval</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Hero image card */}
          <motion.div
            className="relative h-96 sm:h-80 md:h-96 lg:h-full lg:min-h-[500px]"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Blurred background card */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-tata-yellow/10 via-transparent to-tata-blue/10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {/* Glass-morphism effect */}
              <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />

              {/* Content inside card */}
              <motion.div
                className="relative h-full flex flex-col items-center justify-center p-6 sm:p-8 text-white"
                variants={floatingVariants}
                animate="animate"
              >
                {/* Icon placeholder (minimal SVG) */}
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>

                {/* Main heading */}
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2">
                  Ride into 2026
                </h2>

                {/* Subtext */}
                <p className="text-center text-sm sm:text-base text-gray-200 mb-6 max-w-xs">
                  On your new bike — quick loan approvals
                </p>

                {/* Hero CTA */}
                <motion.button
                  onClick={onApply}
                  className="bg-tata-yellow text-slate-900 px-5 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Apply Now
                </motion.button>
              </motion.div>
            </div>

            {/* Floating accent element */}
            <motion.div
              className="absolute -bottom-6 -right-6 w-24 h-24 sm:w-32 sm:h-32 bg-tata-yellow rounded-full opacity-20 blur-2xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Bottom promotional bar - REMOVED */}
      </div>
    </section>
  )
}
