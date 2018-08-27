function mergeRoute(original, template) {
    const result = { ...original };

    for (const key in template) {
        const templateValue = template[key];
        if (typeof templateValue == 'function') {
            const originalValue = original[key];
            if (originalValue) {
                result[key] = (...args) => {
                    templateValue(originalValue, ...args);
                };
            }
            else {
                result[key] = templateValue;
            }
        }
    }

    return result;
}

export function processTabs(tabData) {
    return tabData.map(tab => tab.getTabData());
}

export function processRoutes(childRoutes, templateRoute, store) {
    return childRoutes.map(config => mergeRoute(config.getRoute(store), templateRoute));
}



// WEBPACK FOOTER //
// ./src/client/common/config/config-processor.js