/*
  calculator.js

  Defines the global Calculator object with methods for calculating CO2 emissions,
  comparing transport modes, estimating carbon credits, and their market prices.

  All calculations use values from CONFIG (emission factors, carbon credit prices).
*/

var Calculator = {
  /**
   * calculateEmission(distanceKm, transportMode)
   * 
   * Calculates the total CO2 emission in kg for a trip using a specific transport mode.
   * 
   * @param {number} distanceKm - Distance traveled in kilometers
   * @param {string} transportMode - Transport mode key (e.g., 'carro', 'onibus', etc.)
   * @returns {number} - Emission in kg CO2, rounded to 2 decimal places
   */
  calculateEmission: function (distanceKm, transportMode) {
    // Validate inputs
    if (typeof distanceKm !== 'number' || distanceKm < 0) {
      return 0;
    }

    // Get emission factor from CONFIG
    if (typeof CONFIG === 'undefined' || !CONFIG.EMISSION_FACTORS) {
      console.error('CONFIG is not defined or missing EMISSION_FACTORS');
      return 0;
    }

    // Normalize transport mode key
    var mode = String(transportMode).trim().toLowerCase();
    if (!CONFIG.EMISSION_FACTORS.hasOwnProperty(mode)) {
      console.error('Unknown transport mode: ' + mode);
      return 0;
    }

    // Calculate: distance × factor = emission
    var factor = CONFIG.EMISSION_FACTORS[mode];
    var emission = distanceKm * factor;

    // Round to 2 decimal places
    return Math.round(emission * 100) / 100;
  },

  /**
   * calculateAllModes(distanceKm)
   *
   * Calculates emissions for all available transport modes and compares
   * each against car (baseline) as a percentage.
   *
   * @param {number} distanceKm - Distance in kilometers
   * @returns {array} - Array of objects sorted by emission (lowest first):
   *   [ { mode: 'bicicleta', emission: 0, percentageVsCar: 0 }, ... ]
   */
  calculateAllModes: function (distanceKm) {
    // Validate input
    if (typeof distanceKm !== 'number' || distanceKm < 0) {
      return [];
    }

    if (typeof CONFIG === 'undefined' || !CONFIG.EMISSION_FACTORS) {
      console.error('CONFIG is not defined or missing EMISSION_FACTORS');
      return [];
    }

    // Calculate car (baseline) emission first
    var carEmission = this.calculateEmission(distanceKm, 'carro');
    if (carEmission === 0) {
      // Avoid division by zero
      carEmission = 0.001;
    }

    // Build results array
    var results = [];
    for (var mode in CONFIG.EMISSION_FACTORS) {
      if (CONFIG.EMISSION_FACTORS.hasOwnProperty(mode)) {
        var emission = this.calculateEmission(distanceKm, mode);
        var percentageVsCar = (emission / carEmission) * 100;

        results.push({
          mode: mode,
          emission: emission,
          percentageVsCar: Math.round(percentageVsCar * 100) / 100
        });
      }
    }

    // Sort by emission (lowest first)
    results.sort(function (a, b) {
      return a.emission - b.emission;
    });

    return results;
  },

  /**
   * calculateSavings(emission, baselineEmission)
   *
   * Compares a given emission against a baseline (typically car) and calculates
   * the reduction in kg and percentage.
   *
   * @param {number} emission - Actual emission in kg CO2
   * @param {number} baselineEmission - Baseline emission in kg CO2 (e.g., car)
   * @returns {object} - { savedKg: number, percentage: number }
   */
  calculateSavings: function (emission, baselineEmission) {
    // Validate inputs
    if (typeof emission !== 'number' || emission < 0) emission = 0;
    if (typeof baselineEmission !== 'number' || baselineEmission < 0) baselineEmission = 0;

    // Calculate saved amount
    var savedKg = baselineEmission - emission;
    if (savedKg < 0) savedKg = 0;

    // Calculate percentage saved
    var percentage = 0;
    if (baselineEmission > 0) {
      percentage = (savedKg / baselineEmission) * 100;
    }

    return {
      savedKg: Math.round(savedKg * 100) / 100,
      percentage: Math.round(percentage * 100) / 100
    };
  },

  /**
   * calculateCarbonCredits(emissionKg)
   *
   * Converts emission in kg CO2 to equivalent carbon credits based on
   * CONFIG.CARBON_CREDIT.KG_PER_CREDIT.
   *
   * @param {number} emissionKg - Emission in kilograms of CO2
   * @returns {number} - Number of carbon credits, rounded to 4 decimal places
   */
  calculateCarbonCredits: function (emissionKg) {
    // Validate input
    if (typeof emissionKg !== 'number' || emissionKg < 0) {
      return 0;
    }

    if (typeof CONFIG === 'undefined' || !CONFIG.CARBON_CREDIT) {
      console.error('CONFIG is not defined or missing CARBON_CREDIT');
      return 0;
    }

    // Divide emission by KG_PER_CREDIT
    var kgPerCredit = CONFIG.CARBON_CREDIT.KG_PER_CREDIT;
    var credits = emissionKg / kgPerCredit;

    // Round to 4 decimal places
    return Math.round(credits * 10000) / 10000;
  },

  /**
   * estimateCreditPrice(credits)
   *
   * Estimates the market price range (min, max, average) for a given
   * number of carbon credits based on CONFIG.CARBON_CREDIT prices.
   *
   * @param {number} credits - Number of carbon credits
   * @returns {object} - { min: number, max: number, average: number } in BRL, rounded to 2 decimals
   */
  estimateCreditPrice: function (credits) {
    // Validate input
    if (typeof credits !== 'number' || credits < 0) {
      return { min: 0, max: 0, average: 0 };
    }

    if (typeof CONFIG === 'undefined' || !CONFIG.CARBON_CREDIT) {
      console.error('CONFIG is not defined or missing CARBON_CREDIT');
      return { min: 0, max: 0, average: 0 };
    }

    // Get price boundaries
    var priceMin = CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
    var priceMax = CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;

    // Calculate min and max total price
    var min = credits * priceMin;
    var max = credits * priceMax;
    var average = (min + max) / 2;

    return {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      average: Math.round(average * 100) / 100
    };
  }
};
