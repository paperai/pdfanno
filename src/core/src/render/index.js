import appendChild from './appendChild'

/**
 * Render the response from PDFAnnoCore.getStoreAdapter().getAnnotations to SVG
 *
 * @param {SVGElement} svg The SVG element to render the annotations to
 * @param {Object} viewport The page viewport data
 * @param {Object} data The response from PDFAnnoCore.getStoreAdapter().getAnnotations
 * @return {Promise} Settled once rendering has completed
 *  A settled Promise will be either:
 *    - fulfilled: SVGElement
 *    - rejected: Error
 */
export default function render (svg, viewport, data) {
    return new Promise((resolve, reject) => {
        // Reset the content of the SVG
        svg.innerHTML = ''

        // If there's no data nothing can be done
        if (!data) {
            return resolve(svg)
        }

        // Make sure annotations is an array
        if (!Array.isArray(data.annotations) || data.annotations.length === 0) {
            return resolve(svg)
        }

        // Append annotation to svg
        let elements = []
        data.annotations.forEach((a) => {
            elements.push(appendChild(svg, a, viewport))
        })

        resolve(svg, elements)
    })
}
