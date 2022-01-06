const i18n = require('i18next');
const esES = require('./languages/es-ES.json');
const it = require('./languages/it.json');
const en = require('./languages/en.json');

i18n.init({
    fallbackLng: 'es-ES',
    lng: 'es-ES',
    debug: true,
    resources: {
        'es-ES': esES,
        it,
        en
    }
})

module.exports = i18n
