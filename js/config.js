/*
  config.js
  
  Defines the global CONFIG object with constants and helper methods
  for CO2 emissions calculations and UI interactions.
*/

var CONFIG = {
  // Emission factors in kg CO2 per kilometer
  EMISSION_FACTORS: {
    bicicleta: 0,
    carro: 0.12,
    onibus: 0.089,
    caminhao: 0.96
  },

  // Transport modes metadata with labels, emojis, and UI colors
  TRANSPORT_MODES: {
    bicicleta: {
      label: 'bicicleta',
      icon: '🚲',
      color: '#10b981'
    },
    carro: {
      label: 'carro',
      icon: '🚗',
      color: '#f59e0b'
    },
    onibus: {
      label: 'ônibus',
      icon: '🚌',
      color: '#3b82f6'
    },
    caminhao: {
      label: 'caminhão',
      icon: '🚚',
      color: '#ef4444'
    }
  },

  // Carbon credits pricing and conversion
  CARBON_CREDIT: {
    KG_PER_CREDIT: 1000,
    PRICE_MIN_BRL: 50,
    PRICE_MAX_BRL: 150
  },

  /**
   * populateDatalist()
   * Retrieves all cities from RoutesDB, creates option elements,
   * and appends them to the datalist with id="city-list".
   */
  populateDatalist: function () {
    if (typeof RoutesDB === 'undefined' || !RoutesDB.getAllCities) {
      console.error('RoutesDB is not defined or missing getAllCities method');
      return;
    }

    var datalist = document.getElementById('city-list');
    if (!datalist) {
      console.error('Datalist element with id="city-list" not found');
      return;
    }

    // Clear existing options
    datalist.innerHTML = '';

    // Get all cities and create option elements
    var cities = RoutesDB.getAllCities();
    for (var i = 0; i < cities.length; i++) {
      var option = document.createElement('option');
      option.value = cities[i];
      datalist.appendChild(option);
    }

    console.log('Datalist populated with ' + cities.length + ' cities');
  },

  /**
   * setupDistanceAutoFill()
   * Sets up event listeners for origin/destination inputs and manual checkbox.
   * Automatically fills distance when both cities are selected.
   * Allows manual entry when checkbox is checked.
   */
  setupDistanceAutoFill: function () {
    var origemInput = document.getElementById('origem');
    var destinoInput = document.getElementById('destino');
    var distanciaInput = document.getElementById('distancia');
    var manualCheckbox = document.getElementById('manual');

    if (!origemInput || !destinoInput || !distanciaInput || !manualCheckbox) {
      console.error('Required form elements not found');
      return;
    }

    // Helper function to attempt auto-fill distance
    var autoFillDistance = function () {
      var origem = origemInput.value.trim();
      var destino = destinoInput.value.trim();

      if (!origem || !destino) {
        // Clear distance if either field is empty
        distanciaInput.value = '';
        return;
      }

      // Find distance via RoutesDB
      if (typeof RoutesDB === 'undefined' || !RoutesDB.findDistance) {
        console.error('RoutesDB is not defined or missing findDistance method');
        return;
      }

      var distance = RoutesDB.findDistance(origem, destino);

      if (distance !== null) {
        // Distance found: fill input and set readonly
        distanciaInput.value = distance;
        distanciaInput.setAttribute('readonly', '');
        
        // Show success (helper text would be styled green if present)
        var helperText = distanciaInput.parentElement.querySelector('.field-helper');
        if (helperText) {
          helperText.textContent = '✓ Distância encontrada automaticamente';
          helperText.style.color = '#10b981';
        }
      } else {
        // Distance not found: clear and show suggestion
        distanciaInput.value = '';
        distanciaInput.setAttribute('readonly', '');
        
        var helperText = distanciaInput.parentElement.querySelector('.field-helper');
        if (helperText) {
          helperText.textContent = 'Rota não encontrada. Marque "Inserir distância manualmente" para continuar.';
          helperText.style.color = '#ef4444';
        }
      }
    };

    // Event listener for origin input
    origemInput.addEventListener('change', function () {
      if (!manualCheckbox.checked) {
        autoFillDistance();
      }
    });

    // Event listener for destination input
    destinoInput.addEventListener('change', function () {
      if (!manualCheckbox.checked) {
        autoFillDistance();
      }
    });

    // Event listener for manual checkbox
    manualCheckbox.addEventListener('change', function () {
      if (this.checked) {
        // Allow manual entry: remove readonly
        distanciaInput.removeAttribute('readonly');
        distanciaInput.value = '';
        var helperText = distanciaInput.parentElement.querySelector('.field-helper');
        if (helperText) {
          helperText.textContent = 'Digite a distância em km';
          helperText.style.color = '#6b7280';
        }
      } else {
        // Try auto-fill again
        autoFillDistance();
      }
    });

    console.log('Distance auto-fill setup complete');
  }
};
