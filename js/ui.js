/*
	ui.js

	Defines a single global object `UI` with utility methods for formatting,
	DOM helpers, renderers for results/comparison/carbon credits, and loading
	helpers.

	All methods are documented inline. Render methods return HTML strings that
	can be injected into the DOM by the application.
*/

var UI = {
	/* ======================
		 Utility methods
		 ====================== */
	formatNumber: function (number, decimals) {
		var d = typeof decimals === 'number' ? decimals : 0;
		if (typeof number !== 'number') number = Number(number) || 0;
		// Use toLocaleString for pt-BR formatting with fixed decimals
		return number.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
	},

	formatCurrency: function (value) {
		var v = typeof value === 'number' ? value : Number(value) || 0;
		return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	},

	showElement: function (elementId) {
		var el = document.getElementById(elementId);
		if (!el) return;
		// Support both the .hidden utility and the .show CSS pattern used
		// for result sections (e.g. #resultados.show). Remove 'hidden'
		// and add 'show' so either system will reveal the element.
		el.classList.remove('hidden');
		el.classList.add('show');
	},

	hideElement: function (elementId) {
		var el = document.getElementById(elementId);
		if (!el) return;
		// Add 'hidden' and remove 'show' to ensure element is hidden
		el.classList.add('hidden');
		el.classList.remove('show');
	},

	scrollToElement: function (elementId) {
		var el = document.getElementById(elementId);
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	},

	/* ======================
		 Rendering methods
		 ====================== */
	renderResults: function (data) {
		/*
			data = { origin, destination, distance, emission, mode, savings }

			Output structure (HTML string):
			<div class="results">
				<div class="results__card results__card--route">Origin → Destination</div>
				<div class="results__card results__card--distance">Distance</div>
				<div class="results__card results__card--emission">Emission</div>
				<div class="results__card results__card--transport">Transport icon + label</div>
				<div class="results__card results__card--savings">Savings (if any)</div>
			</div>
		*/

		var modeMeta = (CONFIG && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[data.mode]) || {};

		var origin = data.origin || '';
		var destination = data.destination || '';
		var distance = typeof data.distance === 'number' ? this.formatNumber(data.distance, 1) : (data.distance || '—');
		var emission = typeof data.emission === 'number' ? this.formatNumber(data.emission, 2) : (data.emission || '—');

		var transportIcon = modeMeta.icon || '';
		var transportLabel = modeMeta.label || data.mode || '';

		var savingsHtml = '';
		if (data.savings && typeof data.savings.savedKg === 'number' && data.savings.savedKg > 0) {
			savingsHtml = '\n      <div class="results__card results__card--savings">\n        <div class="results__card-title">Economia</div>\n        <div class="results__card-value">' + this.formatNumber(data.savings.savedKg, 2) + ' kg</div>\n        <div class="results__card-sub">' + this.formatNumber(data.savings.percentage, 2) + '% vs carro</div>\n      </div>';
		}

		var html = '' +
			'<div class="results">' +
				'<div class="results__card results__card--route">' +
					'<div class="results__card-title">Rota</div>' +
					'<div class="results__card-value">' + origin + ' → ' + destination + '</div>' +
				'</div>' +
				'<div class="results__card results__card--distance">' +
					'<div class="results__card-title">Distância</div>' +
					'<div class="results__card-value">' + distance + ' km</div>' +
				'</div>' +
				'<div class="results__card results__card--emission">' +
					'<div class="results__card-title">Emissão estimada</div>' +
					'<div class="results__card-value">🌿 ' + emission + ' kg CO₂</div>' +
				'</div>' +
				'<div class="results__card results__card--transport">' +
					'<div class="results__card-title">Transporte</div>' +
					'<div class="results__card-value">' + transportIcon + ' ' + transportLabel + '</div>' +
				'</div>' +
				savingsHtml +
			'</div>';

		return html;
	},

	renderComparison: function (modesArray, selectedMode) {
		/*
			modesArray: [ { mode, emission, percentageVsCar }, ... ]

			Output per item:
			<div class="comparison__item [--selected]">
				<div class="comparison__mode">icon label</div>
				<div class="comparison__emission">X kg</div>
				<div class="comparison__percent">Y %</div>
			</div>
		*/

		var html = '<div class="comparison">';
		for (var i = 0; i < modesArray.length; i++) {
			var item = modesArray[i];
			var meta = (CONFIG && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[item.mode]) || {};
			var selectedClass = item.mode === selectedMode ? ' comparison__item--selected' : '';

			html += '\n      <div class="comparison__item' + selectedClass + '">';
			html += '\n        <div class="comparison__mode">' + (meta.icon || '') + ' ' + (meta.label || item.mode) + '</div>';
			html += '\n        <div class="comparison__emission">' + this.formatNumber(item.emission, 2) + ' kg</div>';
			html += '\n        <div class="comparison__percent">' + this.formatNumber(item.percentageVsCar, 2) + ' %</div>';
			html += '\n      </div>';
		}
		html += '\n</div>';
		return html;
	},

	renderCarbonCredits: function (creditsData) {
		/*
			creditsData: { credits: number, price: { min, max, average } }

			Output structure:
			<div class="credits">\n  <div class="credits__grid">\n    <div class="results__card">Credits</div>\n    <div class="results__card">Price</div>\n  </div>\n  <div class="credits__info">...</div>\n  <button>Compensar Emissões</button>\n</div>
		*/

		var credits = typeof creditsData.credits === 'number' ? creditsData.credits : 0;
		var price = creditsData.price || { min: 0, max: 0, average: 0 };

		var creditsFormatted = this.formatNumber(credits, 4);
		var avgFormatted = this.formatCurrency(price.average || 0);
		var rangeFormatted = this.formatCurrency(price.min || 0) + ' — ' + this.formatCurrency(price.max || 0);

		var html = '' +
			'<div class="credits">' +
				'<div class="credits__grid">' +
					'<div class="results__card results__card--credits">' +
						'<div class="results__card-title">Créditos necessários</div>' +
						'<div class="results__card-value">' + creditsFormatted + '</div>' +
						'<div class="results__card-sub">1 crédito = ' + (CONFIG && CONFIG.CARBON_CREDIT ? CONFIG.CARBON_CREDIT.KG_PER_CREDIT + ' kg CO₂' : '1000 kg CO₂') + '</div>' +
					'</div>' +
					'<div class="results__card results__card--price">' +
						'<div class="results__card-title">Preço estimado</div>' +
						'<div class="results__card-value">' + avgFormatted + '</div>' +
						'<div class="results__card-sub">Faixa: ' + rangeFormatted + '</div>' +
					'</div>' +
				'</div>' +
				'<div class="credits__info">Créditos de carbono são certificados que representam a redução ou remoção de 1 tonelada de CO₂ equivalente — podem ser comprados para compensar emissões.</div>' +
				'<div class="credits__actions"><button class="btn-compensate">🌱 Compensar Emissões</button></div>' +
			'</div>';

		return html;
	},

	/* ======================
		 Loading helpers
		 ====================== */
	showLoading: function (buttonElement) {
		if (!buttonElement) return;
		// Save original text
		if (!buttonElement.dataset.originalText) {
			buttonElement.dataset.originalText = buttonElement.innerHTML;
		}
		buttonElement.disabled = true;
		buttonElement.innerHTML = '<span class="spinner" aria-hidden="true"></span> Calculando...';
	},

	hideLoading: function (buttonElement) {
		if (!buttonElement) return;
		buttonElement.disabled = false;
		if (buttonElement.dataset.originalText) {
			buttonElement.innerHTML = buttonElement.dataset.originalText;
			delete buttonElement.dataset.originalText;
		}
	}

};

