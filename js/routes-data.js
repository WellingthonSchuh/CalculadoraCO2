/*
	routes-data.js

	Defines a single global object `RoutesDB` which contains a collection
	of pre-defined routes between Brazilian cities and helper methods to
	query that data.

	Structure:
		RoutesDB = {
			routes: [ { origin: string, destination: string, distanceKM: number }, ... ],
			getAllCities: function() -> returns unique sorted array of city names,
			findDistance: function(origin, destination) -> returns distanceKM or null
		}

	Notes:
	- City names are stored as "City, ST" (e.g. "São Paulo, SP").
	- `findDistance` performs a case-insensitive search and checks both directions.
	- This file defines exactly one global variable: `RoutesDB`.
*/

var RoutesDB = (function () {
	// Private helper to normalize strings for comparison
	function _normalize(s) {
		return String(s).trim().toLowerCase();
	}

	// Sample routes covering multiple regions of Brazil (30+ entries)
	var routes = [
		{ origin: 'São Paulo, SP', destination: 'Rio de Janeiro, RJ', distanceKM: 430 },
		{ origin: 'São Paulo, SP', destination: 'Brasília, DF', distanceKM: 1015 },
		{ origin: 'Rio de Janeiro, RJ', destination: 'Brasília, DF', distanceKM: 1148 },
		{ origin: 'São Paulo, SP', destination: 'Campinas, SP', distanceKM: 95 },
		{ origin: 'Rio de Janeiro, RJ', destination: 'Niterói, RJ', distanceKM: 13 },
		{ origin: 'Belo Horizonte, MG', destination: 'Ouro Preto, MG', distanceKM: 100 },
		{ origin: 'Porto Alegre, RS', destination: 'Florianópolis, SC', distanceKM: 460 },
		{ origin: 'Porto Alegre, RS', destination: 'Curitiba, PR', distanceKM: 710 },
		{ origin: 'Curitiba, PR', destination: 'Florianópolis, SC', distanceKM: 300 },
		{ origin: 'Salvador, BA', destination: 'Feira de Santana, BA', distanceKM: 100 },
		{ origin: 'Salvador, BA', destination: 'Recife, PE', distanceKM: 800 },
		{ origin: 'Recife, PE', destination: 'João Pessoa, PB', distanceKM: 120 },
		{ origin: 'Fortaleza, CE', destination: 'Natal, RN', distanceKM: 530 },
		{ origin: 'Fortaleza, CE', destination: 'São Luís, MA', distanceKM: 870 },
		{ origin: 'Manaus, AM', destination: 'Belém, PA', distanceKM: 1740 },
		{ origin: 'Belém, PA', destination: 'Macapá, AP', distanceKM: 520 },
		{ origin: 'Goiânia, GO', destination: 'Brasília, DF', distanceKM: 200 },
		{ origin: 'Goiânia, GO', destination: 'Uberlândia, MG', distanceKM: 450 },
		{ origin: 'Uberlândia, MG', destination: 'Ribeirão Preto, SP', distanceKM: 320 },
		{ origin: 'Ribeirão Preto, SP', destination: 'São José do Rio Preto, SP', distanceKM: 220 },
		{ origin: 'Maceió, AL', destination: 'Aracaju, SE', distanceKM: 270 },
		{ origin: 'Teresina, PI', destination: 'São Luís, MA', distanceKM: 320 },
		{ origin: 'Campo Grande, MS', destination: 'Cuiabá, MT', distanceKM: 700 },
		{ origin: 'Cuiabá, MT', destination: 'Porto Velho, RO', distanceKM: 780 },
		{ origin: 'Belém, PA', destination: 'Manaus, AM', distanceKM: 1740 },
		{ origin: 'Belo Horizonte, MG', destination: 'Rio de Janeiro, RJ', distanceKM: 440 },
		{ origin: 'Belo Horizonte, MG', destination: 'São Paulo, SP', distanceKM: 586 },
		{ origin: 'Porto Alegre, RS', destination: 'São Paulo, SP', distanceKM: 1120 },
		{ origin: 'Recife, PE', destination: 'Fortaleza, CE', distanceKM: 815 },
		{ origin: 'São Paulo, SP', destination: 'Santos, SP', distanceKM: 75 },
		{ origin: 'Campina Grande, PB', destination: 'João Pessoa, PB', distanceKM: 120 },
		{ origin: 'Natal, RN', destination: 'Fortaleza, CE', distanceKM: 535 },
		{ origin: 'Caxias do Sul, RS', destination: 'Porto Alegre, RS', distanceKM: 130 },
		{ origin: 'Vitória, ES', destination: 'Belo Horizonte, MG', distanceKM: 520 },
		{ origin: 'Campos dos Goytacazes, RJ', destination: 'Rio de Janeiro, RJ', distanceKM: 280 },
		{ origin: 'Petrolina, PE', destination: 'Juazeiro, BA', distanceKM: 10 }
	];

	return {
		routes: routes,

		/**
		 * getAllCities
		 * Returns a unique, alphabetically sorted array with all city names
		 * present in the routes dataset (from both origin and destination).
		 */
		getAllCities: function () {
			var citiesSet = new Set();
			for (var i = 0; i < routes.length; i++) {
				citiesSet.add(routes[i].origin);
				citiesSet.add(routes[i].destination);
			}
			var cities = Array.from(citiesSet);
			cities.sort(function (a, b) {
				return a.localeCompare(b, 'pt-BR');
			});
			return cities;
		},

		/**
		 * findDistance(origin, destination)
		 * Searches for a route between origin and destination (case-insensitive).
		 * Checks both directions and returns the distance in KM if found,
		 * otherwise returns null.
		 */
		findDistance: function (origin, destination) {
			if (!origin || !destination) return null;
			var oNorm = _normalize(origin);
			var dNorm = _normalize(destination);

			for (var i = 0; i < routes.length; i++) {
				var r = routes[i];
				if (_normalize(r.origin) === oNorm && _normalize(r.destination) === dNorm) {
					return r.distanceKM;
				}
				if (_normalize(r.origin) === dNorm && _normalize(r.destination) === oNorm) {
					return r.distanceKM;
				}
			}
			return null;
		}
	};
})();

