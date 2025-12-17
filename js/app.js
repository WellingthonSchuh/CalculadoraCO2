/*
  app.js

  Defines the global `APP` object which initializes the application,
  wires up form handlers and orchestrates calls between `CONFIG`, `RoutesDB`,
  `Calculator` and `UI`.
*/

var APP = {
  /**
   * init()
   * Called on page load to prepare UI and form handlers.
   */
  init: function () {
    // Populate city datalist for autocomplete
    if (CONFIG && typeof CONFIG.populateDatalist === 'function') {
      try { CONFIG.populateDatalist(); } catch (err) { console.error(err); }
    }

    // Setup automatic distance autofill behavior
    if (CONFIG && typeof CONFIG.setupDistanceAutoFill === 'function') {
      try { CONFIG.setupDistanceAutoFill(); } catch (err) { console.error(err); }
    }

    // Attach submit handler to the calculator form
    var form = document.getElementById('calculator-form');
    if (!form) {
      console.error('Form #calculator-form not found');
      return;
    }

    form.addEventListener('submit', this._onFormSubmit.bind(this));

    console.log('✅ Calculadora inicializada!');
  },

  /**
   * _onFormSubmit(e)
   * Internal form submit handler. Prevents default submission, validates inputs,
   * shows loading, performs calculations (simulated delay), and renders results.
   */
  _onFormSubmit: function (e) {
    e.preventDefault();

    var form = e.currentTarget;

    // Read form values
    var originEl = form.querySelector('#origem');
    var destinationEl = form.querySelector('#destino');
    var distanceEl = form.querySelector('#distancia');
    var transportChecked = form.querySelector('input[name="transport"]:checked');

    var origin = originEl ? originEl.value.trim() : '';
    var destination = destinationEl ? destinationEl.value.trim() : '';
    var distanceRaw = distanceEl ? distanceEl.value : '';
    var distanceKm = parseFloat(distanceRaw);
    if (isNaN(distanceKm)) distanceKm = 0;
    var transportMode = transportChecked ? transportChecked.value : '';

    // Basic validation
    if (!origin || !destination) {
      alert('Por favor preencha origem e destino.');
      return;
    }
    if (!distanceKm || distanceKm <= 0) {
      alert('Distância inválida. Verifique se a distância foi preenchida automaticamente ou marque "Inserir distância manualmente".');
      return;
    }
    if (!transportMode) {
      alert('Selecione o meio de transporte.');
      return;
    }

    // Submit button and loading state
    var submitButton = form.querySelector('button[type="submit"]');
    UI.showLoading(submitButton);

    // Hide previous results
    UI.hideElement('resultados');
    UI.hideElement('comparacao');
    UI.hideElement('creditos');
    // Also hide inner content containers to ensure they are cleared/hidden
    UI.hideElement('result-content');
    UI.hideElement('comparison-content');
    UI.hideElement('credit-content');

    // Simulate processing delay
    setTimeout(function () {
      try {
        // Calculate emission for selected mode
        var emissionKg = Calculator.calculateEmission(distanceKm, transportMode);

        // Baseline: car emission
        var carEmissionKg = Calculator.calculateEmission(distanceKm, 'carro');

        // Savings compared to car
        var savings = Calculator.calculateSavings(emissionKg, carEmissionKg);

        // Comparison across modes
        var comparisonArray = Calculator.calculateAllModes(distanceKm);

        // Carbon credits and price estimate
        var credits = Calculator.calculateCarbonCredits(emissionKg);
        var priceEstimate = Calculator.estimateCreditPrice(credits);

        // Build render data
        var resultsData = {
          origin: origin,
          destination: destination,
          distance: distanceKm,
          emission: emissionKg,
          mode: transportMode,
          savings: savings
        };

        var creditsData = {
          credits: credits,
          price: priceEstimate
        };

        // Render into DOM
        var resultContainer = document.getElementById('result-content');
        var comparisonContainer = document.getElementById('comparison-content');
        var creditContainer = document.getElementById('credit-content');

        if (resultContainer) {
          resultContainer.innerHTML = UI.renderResults(resultsData);
          UI.showElement('result-content');
        }
        if (comparisonContainer) {
          comparisonContainer.innerHTML = UI.renderComparison(comparisonArray, transportMode);
          UI.showElement('comparison-content');
        }
        if (creditContainer) {
          creditContainer.innerHTML = UI.renderCarbonCredits(creditsData);
          UI.showElement('credit-content');
        }

        // Show parent sections
        UI.showElement('resultados');
        UI.showElement('comparacao');
        UI.showElement('creditos');

        // Scroll to results
        UI.scrollToElement('resultados');

        // Restore button
        UI.hideLoading(submitButton);
      } catch (calcError) {
        console.error(calcError);
        alert('Ocorreu um erro ao calcular as emissões. Tente novamente.');
        UI.hideLoading(submitButton);
      }
    }, 1500);
  }
};

// Auto-initialize on DOM ready
window.addEventListener('DOMContentLoaded', function () {
  if (typeof APP !== 'undefined' && APP.init) APP.init();
});
