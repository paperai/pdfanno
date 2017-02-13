
export default function tomlString(obj, root=true) {

    let lines = [];

    // `version` is first.
    if ('version' in obj) {
        lines.push(`version = "${obj['version']}"`);
        lines.push('');
        delete obj['version'];
    }

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
    console.log('isArray:', val);
    return val && 'length' in val;
}
