import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download,
  ChevronRight,
  Home
} from 'lucide-react'

export default function ApplicationStatus({ applicationId, onBack }) {
  const [status, setStatus] = useState('loading')
  const [applicationData, setApplicationData] = useState(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [expandedStage, setExpandedStage] = useState(0)

  // Workflow stages
  const stages = [
    {
      id: 1,
      name: 'Application Submitted',
      status: 'completed',
      description: 'Your loan application has been received',
      details: 'Your documents are being processed',
      duration: '0-2 hours'
    },
    {
      id: 2,
      name: 'Document Verification',
      status: 'in-progress',
      description: 'KYC & Document Verification',
      details: 'Verifying Aadhaar, PAN, and payslips. Using OCR and deepfake detection.',
      duration: '2-4 hours'
    },
    {
      id: 3,
      name: 'Credit Score Analysis',
      status: 'pending',
      description: 'Credit Scoring & Risk Assessment',
      details: 'Analyzing credit history and assigning risk bucket (LOW/MEDIUM/HIGH)',
      duration: '1-2 hours'
    },
    {
      id: 4,
      name: 'Underwriting Decision',
      status: 'pending',
      description: 'Loan Approval Decision',
      details: 'Applying underwriting rules based on credit score and EMI eligibility',
      duration: '2-4 hours'
    },
    {
      id: 5,
      name: 'Sanction & eSign',
      status: 'pending',
      description: 'Sanction Letter Generation',
      details: 'Creating digitally signed sanction letter with loan terms',
      duration: '1-2 hours'
    },
    {
      id: 6,
      name: 'Completed',
      status: 'pending',
      description: 'Ready for Disbursal',
      details: 'Funds will be disbursed within 24-48 hours',
      duration: '24-48 hours'
    }
  ]

  // Mock application data
  useEffect(() => {
    setApplicationData({
      applicationId: applicationId || 'APP-1735080634290',
      applicantName: 'Rajesh Kumar',
      loanAmount: 300000,
      tenure: 60,
      monthlyEMI: 5700,
      documents: ['Aadhaar', 'PAN', 'Payslip'],
      submittedAt: new Date().toISOString()
    })
    setStatus('loaded')
  }, [applicationId])

  const getStageIcon = (stageStatus) => {
    if (stageStatus === 'completed') return <CheckCircle className="w-6 h-6 text-green-500" />
    if (stageStatus === 'in-progress') return <Clock className="w-6 h-6 text-blue-500 animate-spin" />
    return <AlertCircle className="w-6 h-6 text-gray-400" />
  }

  const getStageColor = (stageStatus) => {
    if (stageStatus === 'completed') return 'bg-green-50 border-green-200'
    if (stageStatus === 'in-progress') return 'bg-blue-50 border-blue-200'
    return 'bg-gray-50 border-gray-200'
  }

  const mockResults = {
    verification: {
      documentVerification: 'PASS',
      deepfakeDetection: 'PASS',
      livenessCheck: 'PASS',
      confidence: 0.98
    },
    creditScore: {
      score: 780,
      riskBucket: 'LOW',
      roi: 7.99,
      preApprovedLimit: 500000
    },
    underwriting: {
      decision: 'APPROVED',
      maxLoanAmount: 500000,
      approvedAmount: 300000,
      emiToSalaryRatio: 0.38
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="animate-spin">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800 mb-4"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Application Status</h1>
          <p className="text-gray-600 text-lg">
            Application ID: <span className="font-mono font-semibold text-yellow-700">{applicationData?.applicationId}</span>
          </p>
        </motion.div>

        {/* Application Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-yellow-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Applicant Name</p>
              <p className="text-2xl font-bold text-gray-800">{applicationData?.applicantName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Loan Amount</p>
              <p className="text-2xl font-bold text-yellow-600">₹{(applicationData?.loanAmount || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Monthly EMI</p>
              <p className="text-2xl font-bold text-blue-600">₹{(applicationData?.monthlyEMI || 0).toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Application Journey</h2>

            <div className="space-y-4">
              {stages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  whileHover={{ translateX: 4 }}
                  onClick={() => setExpandedStage(expandedStage === index ? -1 : index)}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition ${getStageColor(stage.status)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      {getStageIcon(stage.status)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{stage.description}</p>
                          {stage.status === 'in-progress' && (
                            <p className="text-blue-600 text-sm font-medium mt-2">⏱️ Processing... (Est. {stage.duration})</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-opacity-20 " 
                            style={{
                              backgroundColor: stage.status === 'completed' ? '#dcfce7' : stage.status === 'in-progress' ? '#dbeafe' : '#f3f4f6',
                              color: stage.status === 'completed' ? '#166534' : stage.status === 'in-progress' ? '#0c4a6e' : '#6b7280'
                            }}
                          >
                            {stage.status === 'completed' ? '✓ Done' : stage.status === 'in-progress' ? '⟳ In Progress' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedStage === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-300"
                        >
                          <p className="text-gray-700 mb-3">{stage.details}</p>

                          {/* Show mock results for completed/in-progress stages */}
                          {stage.id === 2 && (
                            <div className="bg-white bg-opacity-50 rounded p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Document Verification:</span>
                                <span className="font-semibold text-green-600">{mockResults.verification.documentVerification}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Deepfake Detection:</span>
                                <span className="font-semibold text-green-600">{mockResults.verification.deepfakeDetection}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Liveness Check:</span>
                                <span className="font-semibold text-green-600">{mockResults.verification.livenessCheck}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Confidence Score:</span>
                                <span className="font-semibold">{(mockResults.verification.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          )}

                          {stage.id === 3 && (
                            <div className="bg-white bg-opacity-50 rounded p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Credit Score:</span>
                                <span className="font-semibold text-blue-600 text-lg">{mockResults.creditScore.score}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Risk Bucket:</span>
                                <span className="font-semibold text-green-600">{mockResults.creditScore.riskBucket}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Interest Rate (ROI):</span>
                                <span className="font-semibold">{mockResults.creditScore.roi}% p.a.</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pre-approved Limit:</span>
                                <span className="font-semibold">₹{mockResults.creditScore.preApprovedLimit.toLocaleString()}</span>
                              </div>
                            </div>
                          )}

                          {stage.id === 4 && (
                            <div className="bg-white bg-opacity-50 rounded p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Underwriting Decision:</span>
                                <span className="font-semibold text-green-600 text-lg">{mockResults.underwriting.decision}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Approved Amount:</span>
                                <span className="font-semibold">₹{mockResults.underwriting.approvedAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>EMI to Salary Ratio:</span>
                                <span className="font-semibold">{(mockResults.underwriting.emiToSalaryRatio * 100).toFixed(1)}%</span>
                              </div>
                              <p className="text-gray-600 text-xs mt-3">✓ All underwriting criteria met</p>
                            </div>
                          )}

                          {stage.id === 5 && (
                            <div className="bg-white bg-opacity-50 rounded p-4 space-y-3 text-sm">
                              <div className="flex items-center gap-3 p-3 bg-green-100 bg-opacity-50 rounded">
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="text-green-800">Digital Sanction Letter Generated</span>
                              </div>
                              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition">
                                <Download className="w-4 h-4" />
                                Download Sanction Letter (PDF)
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Next Steps CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">📋 What Happens Next?</h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>We'll verify your documents using advanced KYC technology</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Your credit score will be analyzed for risk assessment</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Our underwriting engine will make the approval decision</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>You'll receive a digitally signed sanction letter</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Funds will be disbursed within 24-48 hours of approval</span>
            </li>
          </ul>
          <p className="text-sm opacity-90">
            ⏱️ Total processing time: 8-14 hours | You'll receive updates via email & SMS
          </p>
        </motion.div>
      </div>
    </div>
  )
}
