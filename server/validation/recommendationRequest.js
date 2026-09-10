const allowedValues = {
  time: [
    'up-to-20',
    'up-to-30',
    'up-to-60',
    'up-to-120',
    'over-120',
    'no-preference',
  ],
  complexity: [
    'light',
    'some-strategy',
    'moderate',
    'deep',
    'no-preference',
  ],
  mood: [
    'relaxed',
    'social',
    'competitive',
    'cooperative',
    'strategic',
    'immersive',
    'chaotic',
    'no-preference',
  ],
  style: [
    'working-things-out',
    'building-collecting',
    'planning-managing',
    'talking-guessing',
    'working-together',
    'competing-directly',
    'theme-story',
    'quick-simple',
    'no-preference',
  ],
  contentPreference: [
    'family-friendly',
    'mature-okay',
    'no-preference',
  ],
}

const requiredFields = [
  'players',
  'time',
  'complexity',
  'mood',
  'style',
  'youngestPlayerAge',
  'contentPreference',
]

function validateSingleChoice(body, field, errors) {
  if (field in body && !allowedValues[field].includes(body[field])) {
    errors.push({
      field,
      message: `${field} contains an unsupported value.`,
    })
  }
}

function validateMultiChoice(body, field, errors) {
  if (!(field in body)) {
    return
  }

  const values = body[field]

  if (!Array.isArray(values)) {
    errors.push({
      field,
      message: `${field} must contain a list of selected values.`,
    })
    return
  }

  if (values.length < 1 || values.length > 2) {
    errors.push({
      field,
      message: `${field} must contain one or two selections.`,
    })
    return
  }

  const uniqueValues = new Set(values)

  if (uniqueValues.size !== values.length) {
    errors.push({
      field,
      message: `${field} cannot contain duplicate selections.`,
    })
  }

  for (const value of values) {
    if (!allowedValues[field].includes(value)) {
      errors.push({
        field,
        message: `${field} contains an unsupported value.`,
      })
      break
    }
  }

  if (values.includes('no-preference') && values.length > 1) {
    errors.push({
      field,
      message: `${field} cannot combine no preference with another selection.`,
    })
  }
}

function validateRecommendationRequest(body) {
  const errors = []

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      errors: [
        {
          field: null,
          message: 'Request body must be a JSON object.',
        },
      ],
    }
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      errors.push({
        field,
        message: `${field} is required.`,
      })
    }
  }

  if (
    'players' in body &&
    (!Number.isInteger(body.players) || body.players < 1)
  ) {
    errors.push({
      field: 'players',
      message: 'players must be a whole number of at least 1.',
    })
  }

  if (
    'youngestPlayerAge' in body &&
    (!Number.isInteger(body.youngestPlayerAge) || body.youngestPlayerAge < 0)
  ) {
    errors.push({
      field: 'youngestPlayerAge',
      message: 'youngestPlayerAge must be a whole number of 0 or greater.',
    })
  }

  validateSingleChoice(body, 'time', errors)
  validateSingleChoice(body, 'complexity', errors)
  validateSingleChoice(body, 'contentPreference', errors)

  validateMultiChoice(body, 'mood', errors)
  validateMultiChoice(body, 'style', errors)

  return {
    valid: errors.length === 0,
    errors,
  }
}

module.exports = {
  validateRecommendationRequest,
}