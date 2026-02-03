function getEnv(name) {
  return process.env[name];
}

function getMissingKeys() {
  const required = ['OPENROUTER_API_KEY', 'GOOGLE_MAPS_API_KEY'];
  return required.filter((key) => !getEnv(key));
}

function getConfig() {
  const missingKeys = getMissingKeys();
  return {
    aiReady: missingKeys.length === 0,
    missingKeys,
    visionModel: getEnv('OPENROUTER_VISION_MODEL') || 'allenai/molmo-72b-0924',
    descriptionModel:
      getEnv('OPENROUTER_DESCRIPTION_MODEL') ||
      'meta-llama/llama-3.3-70b-instruct',
  };
}

module.exports = { getConfig };
