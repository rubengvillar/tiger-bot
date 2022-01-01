const i18n = require('i18next');
const esES = require('./languages/es-ES.json');
const it = require('./languages/it.json');

i18n.init({
    fallbackLng: 'es-ES',
    lng: 'es-ES',
    debug: true,
    resources: {
        'es-ES': esES,
        it
    }
})

module.exports = i18n
