function templateFinder(types, typesOrder, templates) {
    for (let i = 0; i < typesOrder.length; i++) {
        const targetType = typesOrder[i];
        const template = templates[targetType];
        if (template && types.indexOf(targetType) > -1) {
            return template;
        }
    }
}

export function templateBatchProcessor(models, typesOrder: string[], templates, props?) {
    return models.map((model, i) => {
        return templateProcessor(model, i, typesOrder, templates, props);
    });
}

export function templateProcessor(model, index: number, typesOrder: string[], templates, props?) {
    let template = templateFinder(model.types, typesOrder, templates);

    return template ? template(model, index, props) : undefined;
}



// WEBPACK FOOTER //
// ./src/client/common/util/TemplateProcessor.ts