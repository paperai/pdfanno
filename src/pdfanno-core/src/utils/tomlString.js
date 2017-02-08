
export default function tomlString(obj, root=true) {

    let lines = [];

    Object.keys(obj).forEach(prop => {

        let val = obj[prop];
        if (typeof val === 'string') {
            lines.push(`${prop} = "${val}"`);
            root && lines.push('');

        } else if (typeof val === 'number') {
            lines.push(`${prop} = ${val}`);
            root && lines.push('');

        } else if (isArray(val)) {
            lines.push(`${prop} = ${JSON.stringify(val)}`);
            root && lines.push('');

        } else if (typeof val === 'object') {
            lines.push(`[${prop}]`);
            lines.push(tomlString(val, false));
            root && lines.push('');
        }
    });

    return lines.join('\n');
}

function isArray(val) {
    return 'length' in val;
}
