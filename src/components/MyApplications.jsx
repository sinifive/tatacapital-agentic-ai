import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Download,
  Eye,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Home,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'
import ApplicationStatus from './ApplicationStatus'

export default function MyApplications({ onBack }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [searchId, setSearchId] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/api/applications')
      
      if (response.data.applications && Array.isArray(response.data.applications)) {
        // Parse documents if they're JSON strings
        const parsed = response.data.applications.map(app => ({
          ...app,
          documents: typeof app.documents === 'string' ? JSON.parse(app.documents) : app.documents
        }))
        setApplications(parsed)
      } else {
        setApplications([])
      }
    } catch (err) {
      setError('Failed to fetch applications. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return '📋'
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      case 'pending':
        return '⏳'
      default:
        return '📄'
    }
  }

  const handleSearchById = async (e) => {
    e.preventDefault()
    if (!searchId.trim()) return

    try {
      const response = await axios.get(`/api/application/${searchId}`)
      if (response.data.application) {
        setSelectedApplication(response.data.application)
      } else {
        setError('Application not found')
      }
    } catch (err) {
      setError('Application not found. Please check the ID and try again.')
      console.error(err)
    }
  }

  // Show application status if one is selected
  if (selectedApplication) {
    return (
      <ApplicationStatus 
        applicationId={selectedApplication.applicationId}
        onBack={() => {
          setSelectedApplication(null)
          setSearchId('')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Applications</h1>
          <p className="text-gray-600">View and track all your loan applications</p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-yellow-500"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Application</h2>
          <form onSubmit={handleSearchById} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Application ID (e.g., app-1735080634290)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <RefreshCw className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading your applications...</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">You haven't submitted any loan applications yet.</p>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
            >
              Go Back and Apply
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Applications List */}
        {!loading && applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Your Applications ({applications.length})
              </h2>
              <button
                onClick={fetchApplications}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {applications.map((app, index) => (
              <motion.div
                key={app.applicationId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ translateX: 4 }}
                onClick={() => setSelectedApplication(app)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-yellow-500 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{app.applicantName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)} {app.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm font-mono">{app.applicationId}</p>
                    </div>
                    <Eye className="w-5 h-5 text-yellow-600" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-gray-500 text-xs uppercase">Loan Amount</p>
                      <p className="text-lg font-bold text-yellow-600">₹{(app.loanAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase">Tenure</p>
                      <p className="text-lg font-bold text-gray-800">{app.tenure} months</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase">Purpose</p>
                      <p className="text-sm font-semibold text-gray-700 capitalize">{app.purpose || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase">Documents</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {(app.documents ? (Array.isArray(app.documents) ? app.documents.length : 0) : 0)} files
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium text-sm">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
