import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load rules from JSON file
const loadRules = () => {
  const rulesPath = path.join(__dirname, 'rules.json')
  const rulesData = fs.readFileSync(rulesPath, 'utf8')
  return JSON.parse(rulesData)
}

// Calculate EMI using compound interest formula
// EMI = (P * r * (1 + r)^n) / ((1 + r)^n - 1)
const calculateEMI = (principal, annualROI, tenureMonths) => {
  const monthlyRate = annualROI / 12 / 100
  
  if (monthlyRate === 0) {
    return principal / tenureMonths
  }

  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1
  
  return Math.round(numerator / denominator * 100) / 100
}

// Get pre-approved limit and ROI based on credit score
const getRiskBucketDetails = (creditScore, rules) => {
  const buckets = rules.risk_buckets
  
  if (creditScore >= 750) {
    return { bucket: 'LOW', ...buckets.low }
  }
  if (creditScore >= 700) {
    return { bucket: 'MEDIUM', ...buckets.medium }
  }
  return { bucket: 'HIGH', ...buckets.high }
}

// Main underwriting engine
export const runUnderwriting = (applicantData) => {
  const rules = loadRules()
  const auditLog = []
  const timestamp = new Date().toISOString()

  const {
    applicant_name,
    pan,
    credit_score,
    requested_amount,
    monthly_salary,
    tenure_months = rules.emi_calculation.default_tenure_months,
  } = applicantData

  // Validation
  if (!credit_score || !requested_amount || !monthly_salary) {
    return {
      status: 'ERROR',
      message: 'Missing required fields: credit_score, requested_amount, monthly_salary',
      timestamp,
    }
  }

  // Step 1: Credit score threshold check
  const creditScoreRule = rules.underwriting_rules.credit_score_threshold
  auditLog.push({
    rule: 'credit_score_threshold',
    description: creditScoreRule.description,
    check: `credit_score (${credit_score}) >= ${creditScoreRule.min_score}`,
    passed: credit_score >= creditScoreRule.min_score,
  })

  if (credit_score < creditScoreRule.min_score) {
    return {
      status: 'REJECTED',
      decision: 'CREDIT_SCORE_LOW',
      credit_score,
      requested_amount,
      reason: `Credit score ${credit_score} is below minimum threshold of ${creditScoreRule.min_score}`,
      auditLog,
      timestamp,
    }
  }

  // Get risk bucket and pre-approved limit
  const riskBucket = getRiskBucketDetails(credit_score, rules)
  const preApprovedLimit = riskBucket.pre_approved_limit
  const annualROI = riskBucket.annual_roi

  auditLog.push({
    rule: 'risk_classification',
    description: `Applicant mapped to ${riskBucket.bucket} risk bucket`,
    credit_score,
    pre_approved_limit: preApprovedLimit,
    annual_roi: annualROI,
  })

  // Step 2: Pre-approved limit check
  const preApprovedRule = rules.underwriting_rules.pre_approved_limit
  auditLog.push({
    rule: 'pre_approved_limit',
    description: preApprovedRule.description,
    check: `requested_amount (${requested_amount}) <= pre_approved_limit (${preApprovedLimit})`,
    passed: requested_amount <= preApprovedLimit,
  })

  if (requested_amount <= preApprovedLimit) {
    const emi = calculateEMI(requested_amount, annualROI, tenure_months)
    return {
      status: 'APPROVED',
      decision: 'WITHIN_PRE_APPROVED_LIMIT',
      applicant_name,
      pan,
      credit_score,
      risk_bucket: riskBucket.bucket,
      requested_amount,
      pre_approved_limit: preApprovedLimit,
      approved_amount: requested_amount,
      tenure_months,
      annual_roi: annualROI,
      monthly_emi: emi,
      monthly_salary,
      emi_to_salary_ratio: Math.round((emi / monthly_salary) * 100) / 100,
      emi_calculation_formula: {
        formula: rules.emi_calculation.formula,
        where: rules.emi_calculation.where,
        applied_values: {
          principal: requested_amount,
          monthly_rate: `${annualROI / 12 / 100} (${annualROI}% annual / 12)`,
          tenure_months,
        },
      },
      auditLog,
      timestamp,
    }
  }

  // Step 3: Salary check for amounts up to 2x pre-approved limit
  const salaryCheckRule = rules.underwriting_rules.salary_check_threshold
  const salaryCheckLimit = preApprovedLimit * salaryCheckRule.multiplier

  auditLog.push({
    rule: 'salary_check_threshold',
    description: salaryCheckRule.description,
    check: `requested_amount (${requested_amount}) <= 2x_pre_limit (${salaryCheckLimit})`,
    passed: requested_amount <= salaryCheckLimit,
  })

  if (requested_amount <= salaryCheckLimit) {
    const emi = calculateEMI(requested_amount, annualROI, tenure_months)
    const maxEMI = monthly_salary * salaryCheckRule.emi_to_salary_ratio
    const emiRatio = emi / monthly_salary

    auditLog.push({
      rule: 'emi_to_salary_check',
      description: `EMI must be <= ${salaryCheckRule.emi_to_salary_ratio * 100}% of monthly salary`,
      check: `EMI (${Math.round(emi)}) <= max_emi (${Math.round(maxEMI)})`,
      emi: Math.round(emi),
      monthly_salary,
      max_emi: Math.round(maxEMI),
      emi_to_salary_ratio: Math.round(emiRatio * 100) / 100,
      passed: emi <= maxEMI,
    })

    if (emi <= maxEMI) {
      return {
        status: 'APPROVED',
        decision: 'SALARY_CHECK_PASSED',
        applicant_name,
        pan,
        credit_score,
        risk_bucket: riskBucket.bucket,
        requested_amount,
        pre_approved_limit: preApprovedLimit,
        approved_amount: requested_amount,
        tenure_months,
        annual_roi: annualROI,
        monthly_emi: emi,
        monthly_salary,
        emi_to_salary_ratio: Math.round(emiRatio * 100) / 100,
        emi_calculation_formula: {
          formula: rules.emi_calculation.formula,
          where: rules.emi_calculation.where,
          applied_values: {
            principal: requested_amount,
            monthly_rate: `${annualROI / 12 / 100} (${annualROI}% annual / 12)`,
            tenure_months,
          },
        },
        auditLog,
        timestamp,
      }
    } else {
      auditLog.push({
        rule: 'default_rejection',
        description: 'EMI exceeds 50% of monthly salary',
        reason: `EMI of ${Math.round(emi)} exceeds max allowed ${Math.round(maxEMI)}`,
      })

      return {
        status: 'REJECTED',
        decision: 'EMI_TOO_HIGH',
        applicant_name,
        pan,
        credit_score,
        risk_bucket: riskBucket.bucket,
        requested_amount,
        pre_approved_limit: preApprovedLimit,
        monthly_salary,
        requested_emi: Math.round(emi),
        max_emi_allowed: Math.round(maxEMI),
        reason: `EMI of ${Math.round(emi)} exceeds 50% of salary (max: ${Math.round(maxEMI)})`,
        auditLog,
        timestamp,
      }
    }
  }

  // Step 4: Default rejection
  auditLog.push({
    rule: 'default_rejection',
    description: 'Amount exceeds 2x pre-approved limit',
    requested_amount,
    max_allowed: salaryCheckLimit,
  })

  return {
    status: 'REJECTED',
    decision: 'AMOUNT_TOO_HIGH',
    applicant_name,
    pan,
    credit_score,
    risk_bucket: riskBucket.bucket,
    requested_amount,
    pre_approved_limit: preApprovedLimit,
    max_amount_with_salary_check: salaryCheckLimit,
    reason: `Requested amount ${requested_amount} exceeds maximum allowed ${salaryCheckLimit}`,
    auditLog,
    timestamp,
  }
}
