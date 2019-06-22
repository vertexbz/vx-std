export type TemplateValuesType = {
    [key: string]: string
};

export class TemplateString extends String {
    values?: TemplateValuesType;
    template: string;

    constructor(template: string, values?: TemplateValuesType) {
        // $FlowIgnore
        super(values ? template.replace(/{{\s*([a-z0-9-_]+)\s*}}/gi, (match, variable) => values[variable] || match) : template);
        this.values = values;
        this.template = template;
    }
}
