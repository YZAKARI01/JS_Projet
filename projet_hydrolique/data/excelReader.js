const { cleanData } = require('./dataCleaner');
const ExcelJS = require('exceljs');

async function readExcelData(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const data = [];

    worksheet.eachRow((row, rowNumber) => {
        const rowValues = row.values.map(cell => {
            // Si le type de cellule est un objet, essayez d'extraire la valeur réelle
            if (cell && typeof cell === 'object') {
                if (cell.hasOwnProperty('result')) {
                    // Si c'est une formule, utilisez le résultat
                    return cell.result;
                } else if (cell.hasOwnProperty('richText')) {
                    // Si c'est du texte enrichi, concaténez les parties du texte
                    return cell.richText.map(r => r.text).join('');
                } else {
                    // Autres cas, utilisez null
                    return null;
                }
            }
            // Si c'est une valeur primitive, retournez-la
            return cell;
        });
        data.push(rowValues);
        // si le fichiers le fichiers ne fonctionne pas la lecture ne peux pas finctionne 
    });

    const cleaned = cleanData(data);
    
    return cleaned;
}

module.exports = readExcelData;
