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

  for (const [field, values] of Object.entries(allowedValues)) {
    if (field in body && !values.includes(body[field])) {
      errors.push({
        field,
        message: `${field} contains an unsupported value.`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

module.exports = {
  validateRecommendationRequest,
}