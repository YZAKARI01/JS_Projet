function cleanData(data) {
    const result = [];
    let titlesList = []; // Pour stocker les titres uniques

    data.forEach(row => {
        let alreadySeen = {};
        let alreadyAddedToTitles = {}; // Pour éviter d'ajouter plusieurs fois le même titre dans titlesList
        const cleanedRow = [];

        row.forEach(cell => {
            if (cell !== null && cell !== undefined) {
                if (!alreadySeen[cell]) {
                    // Si la cellule n'a pas été vue, ajouter à alreadySeen
                    alreadySeen[cell] = 1;
                    cleanedRow.push(cell);
                } else {
                    // Si la cellule a été vue et n'est pas encore ajoutée à titlesList, l'ajouter
                    alreadySeen[cell]++;
                    cleanedRow.push(cell); // Conserver toutes les valeurs y compris les doublons
                    if (!alreadyAddedToTitles[cell] && typeof cell === 'string') {
                        titlesList.push(cell);
                        alreadyAddedToTitles[cell] = true;
                    }
                }
            }
        });

        if (cleanedRow.length > 0) result.push(cleanedRow);
    });

    return { cleanedData: result, titlesList };
}

module.exports = { cleanData };
