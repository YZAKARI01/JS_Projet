document.addEventListener('DOMContentLoaded', async function () {
  const ctx = document.getElementById('myChart').getContext('2d');
  const zoomCheckbox = document.getElementById('zoomCheckbox');
  const startYearInput = document.getElementById('startYear');
  const endYearInput = document.getElementById('endYear');
  const applyIntervalButton = document.getElementById('applyInterval');

  async function fetchCleanedData() {
      const response = await fetch('/data');
      if (!response.ok) {
          throw new Error('Échec de la récupération des données');
      }
      return response.json();
  }

  try {
      const cleanedData = await fetchCleanedData();
      const dataToUse = cleanedData.cleanedData;
      const titlesList = cleanedData.titlesList;
      const chartTitle = titlesList[0]; // Suppose que le premier élément est le titre

      // Extraire les étiquettes dynamiques (excluant le premier élément qui est "DATE" ou "Année")
      const dynamicLabels = dataToUse[1].slice(1);

      // Initialiser les tableaux de données pour les étiquettes dynamiques
      const dynamicDataSets = dynamicLabels.map((label, index) => {
          return {
              label: label,
              data: dataToUse.slice(2).map(row => row[index + 1]),
              backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
              borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
              borderWidth: 1,
              type: 'bar'
          };
      });

      // Extraire les étiquettes pour l'axe des x
      const labels = dataToUse.slice(2).map(row => row[0]);

      // Calculer Apport Total, Moyenne Annuelle et Variation
      const apportTotal = dataToUse.slice(2).map(row => row.slice(1).reduce((sum, value) => sum + (value || 0), 0));
      const moyenneAnnuelle = apportTotal.reduce((sum, value) => sum + value, 0) / apportTotal.length;
      const variation = apportTotal.map((value, index, array) => {
          if (index === 0) return 0; // Pas de variation pour la première année
          return value - array[index - 1];
      });

      // Ajouter les jeux de données Apport Total, Moyenne Annuelle et Variation
      dynamicDataSets.push({
          label: 'Apport Total',
          data: apportTotal,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          type: 'line',
          fill: false
      });
      dynamicDataSets.push({
          label: 'Moyenne Annuelle',
          data: new Array(labels.length).fill(moyenneAnnuelle),
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
          type: 'line',
          fill: false
      });
      dynamicDataSets.push({
          label: 'Variation',
          data: variation,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          type: 'line',
          fill: false
      });

      const data = {
          labels: labels,
          datasets: dynamicDataSets
      };

      const config = {
          type: 'bar',
          data: data,
          options: {
              plugins: {
                  title: {
                      display: true,
                      text: chartTitle
                  },
                  zoom: {
                      pan: {
                          enabled: zoomCheckbox.checked, // Activer le déplacement en fonction de la case à cocher
                          mode: 'xy' // Permettre le déplacement sur les deux axes (x et y)
                      },
                      zoom: {
                          wheel: {
                              enabled: zoomCheckbox.checked, // Activer le zoom par défilement vertical en fonction de la case à cocher
                              speed: 0.1,
                          },
                          pinch: {
                              enabled: zoomCheckbox.checked,
                          },
                          mode: 'xy',
                          rangeMin: {
                              x: null,
                              y: null
                          },
                          rangeMax: {
                              x: null,
                              y: null
                          },
                      },
                  }
              },
              scales: {
                  x: {
                      beginAtZero: true,
                  },
                  y: {
                      beginAtZero: true,
                  }
              }
          }
      };

      const myChart = new Chart(ctx, config);

      // Écouter l'événement de changement d'état de la case à cocher
      zoomCheckbox.addEventListener('change', () => {
          const isEnabled = zoomCheckbox.checked;
          myChart.options.plugins.zoom.pan.enabled = isEnabled;
          myChart.options.plugins.zoom.zoom.wheel.enabled = isEnabled;
          myChart.options.plugins.zoom.zoom.pinch.enabled = isEnabled;

          // Mettre à jour le graphique
          myChart.update();
      });

      // Fonction pour appliquer l'intervalle sélectionné
      applyIntervalButton.addEventListener('click', () => {
          const startYearInputVal = startYearInput.value.trim();
          const endYearInputVal = endYearInput.value.trim();

          // Si les champs sont vides, réinitialiser le graphique
          if (startYearInputVal === '' && endYearInputVal === '') {
              myChart.data.labels = labels;
              myChart.data.datasets = dynamicDataSets;
              myChart.update();
              return;
          }

          // Validate the format "année-année"
          const yearRegex = /^\d{4}-\d{4}$/;

          if (!yearRegex.test(startYearInputVal) || !yearRegex.test(endYearInputVal)) {
              alert('Veuillez entrer des années valides sous la forme "2000-2001"');
              return;
          }

          const startYear = parseInt(startYearInputVal.split('-')[0]);
          const endYear = parseInt(endYearInputVal.split('-')[1]);

          // Validate if startYear is less than or equal to endYear
          if (startYear > endYear) {
              alert('L\'année de début doit être inférieure ou égale à l\'année de fin.');
              return;
          }

          const startIndex = labels.findIndex(label => parseInt(label.split('-')[0]) >= startYear);
          const endIndex = labels.findIndex(label => parseInt(label.split('-')[0]) > endYear);

          if (startIndex === -1 || startIndex >= labels.length) {
              alert('Les années fournies ne correspondent pas aux données disponibles.');
              return;
          }

          const filteredLabels = labels.slice(startIndex, endIndex === -1 ? labels.length : endIndex);
          const filteredDataSets = dynamicDataSets.map(dataset => ({
              ...dataset,
              data: dataset.data.slice(startIndex, endIndex === -1 ? dataset.data.length : endIndex)
          }));

          myChart.data.labels = filteredLabels;
          myChart.data.datasets = filteredDataSets;
          myChart.update();
      });

  } catch (error) {
      console.error('Erreur lors de la récupération ou du traitement des données:', error);
  }
});
