export type TemplateValuesType = Record<string, string | number>;

const interpolate = (template: string, values?: TemplateValuesType): string => {
    if (!values) {
        return template;
    }

    return template.replace(/{{\s*([a-z0-9-_]+)\s*}}/gi, (match, variable) => {
        if (variable in values) {
            return String(values[variable]);
        }

        return match;
    });
};

/**
 * Extended string that can hold template and values for interpolation,
 * useful for localization
 */
export class TemplateString extends String {
    public readonly values?: TemplateValuesType;
    public readonly template: string;

    public constructor(template: string, values?: TemplateValuesType) {
        super(interpolate(template, values));
        this.values = values;
        this.template = template;
    }
}
